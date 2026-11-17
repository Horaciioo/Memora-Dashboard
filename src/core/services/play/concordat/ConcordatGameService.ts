import 'server-only'

import { randomInt } from 'node:crypto'

import { conflict } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import {
  CONCORDAT_RESYNC,
  concordatSettingsOf,
  createGame,
  decodeMap,
  encodeMap,
  exportState,
  generateMap,
  importState,
  intentFromBody,
  intentRefusal,
  boardFor,
  sharedBoardOf,
} from '@/core/lib/play/concordat'
import type { ConcordatBoard } from '@/core/lib/play/concordat'
import { signalPlay } from '@/core/lib/play/signal'
import { databaseHost, PROCESS_OWNER } from '@/core/services/play/concordat/ConcordatHost'
import {
  loopOf,
  queueIntent,
  startLoop,
  wakeLoop,
} from '@/core/services/play/concordat/ConcordatLoop'
import {
  botAccountLevels,
  claimGame,
  createGameRows,
  loadGameRow,
  unpackSnapshot,
} from '@/core/services/play/concordat/ConcordatStore'
import { CONCORDAT, CONCORDAT_ERRORS, CONCORDAT_REFUSALS } from '@/declarations/play'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import { CONCORDAT_SETTINGS } from '@/declarations/play/concordat/settings'
import type { EngineSession, EngineStep } from '@/types/play'
import type { ConcordatMap, ConcordatState } from '@/types/concordat'
import { CONCORDAT_RANDOM_STYLE, ConcordatPhases } from '@/utils/constants/concordat'
import type { ConcordatBotLevelName } from '@/utils/constants/concordat'
import { SECOND_MS } from '@/utils/constants/time'

// Revisions jump when a game is restored, readers start over
const EPOCH_STEP = 1_000_000
// Fair starts asked on top of the seats, countries may take some
const EXTRA_STARTS = 24
// Seeds tried before giving up on a crowded map
const MAP_ATTEMPTS = 6
// Seconds a reader waits between two board requests
const RESYNC_COOLDOWN_MS = 3 * SECOND_MS

const IDLE: EngineStep = { changed: false, finished: false, deadline: null }

// Last board request per player
const resyncs = new Map<string, number>()

// Level of the nations held by bot accounts
const botNationsOf = async (state: ConcordatState): Promise<Map<number, ConcordatBotLevelName>> => {
  const accounts = state.players.flatMap((player) => (player.accountId ? [player.accountId] : []))
  const levels = await botAccountLevels(accounts)
  const nations = new Map<number, ConcordatBotLevelName>()
  for (const player of state.players) {
    const level = player.accountId ? levels.get(player.accountId) : undefined
    if (level) nations.set(player.id, level)
  }

  return nations
}

// Map with a start for every seat
const mapFor = (session: EngineSession): { map: ConcordatMap; seed: number } => {
  const settings = concordatSettingsOf(session.settings)
  const firstSeed = settings.seed ?? randomInt(0, 2_000_000_000)

  for (let attempt = 0; attempt < MAP_ATTEMPTS; attempt++) {
    // A random region is drawn again on every attempt
    const style =
      settings.style === CONCORDAT_RANDOM_STYLE
        ? CONCORDAT_SETTINGS.styles[randomInt(0, CONCORDAT_SETTINGS.styles.length)]
        : settings.style
    const seed = (firstSeed + attempt) % 2_000_000_000
    const map = generateMap({
      seed,
      size: settings.size,
      style,
      actors: session.players.length + EXTRA_STARTS,
    })
    if (map.starts.length >= session.players.length) return { map, seed }
  }

  throw conflict(CONCORDAT_ERRORS.mapTooSmall)
}

/**
 * Build the game, write it and start ticking
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openGame = async (session: EngineSession): Promise<EngineStep> => {
  const settings = concordatSettingsOf(session.settings)
  const { map, seed } = mapFor(session)
  const state = createGame({
    map,
    seats: session.players,
    speed: CONCORDAT.speeds[settings.speed],
    durationMinutes: settings.durationMinutes,
    seed,
    protectionSeconds: settings.protectionMinutes * 60,
    startTroops: settings.startTroops / CONCORDAT.sim.troopUnit,
    mode: settings.mode,
    teams: settings.teams,
    weapons: settings.weapons,
    populate: { size: settings.size, difficulty: settings.difficulty },
  })

  await createGameRows(
    {
      sessionId: session.id,
      seed,
      size: settings.size,
      style: map.style,
      speed: settings.speed,
      durationMinutes: settings.durationMinutes,
      map: encodeMap(map),
      snapshot: exportState(state),
      nations: session.players.map((accountId, index) => ({ accountId, nation: index + 1 })),
    },
    PROCESS_OWNER
  )
  startLoop({
    sessionId: session.id,
    state,
    host: databaseHost(session.id, () => state),
    botNations: await botNationsOf(state),
  })

  return { changed: true, finished: false, deadline: null }
}

// Bring a game back from its last snapshot
const restoreGame = async (sessionId: string): Promise<EngineStep> => {
  const row = await loadGameRow(sessionId)
  if (!row) return IDLE
  if (row.phase === ConcordatPhases.Ended) return { changed: true, finished: true, deadline: null }
  if (!row.snapshot || !(await claimGame(sessionId, PROCESS_OWNER))) return IDLE

  const state = importState(decodeMap(row.map), unpackSnapshot(row.snapshot))
  startLoop({
    sessionId,
    state,
    host: databaseHost(sessionId, () => state),
    rev: row.rev + EPOCH_STEP,
    botNations: await botNationsOf(state),
  })
  logger.warn(`[concordat] ${sessionId} restored at tick ${state.tick}`)

  return { changed: true, finished: false, deadline: null }
}

/**
 * Keep the game ticking, restore it after a restart
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleGame = async (session: EngineSession): Promise<EngineStep> => {
  if (loopOf(session.id)) {
    wakeLoop(session.id)

    return IDLE
  }

  return restoreGame(session.id)
}

/**
 * Take a command of a player
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body
 * @return {Promise<EngineStep>} - Step
 */

export const actInGame = async (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> => {
  const loop = loopOf(session.id)
  if (!loop) throw conflict(CONCORDAT_ERRORS.gone)

  const nation = loop.state.players.find((player) => player.accountId === accountId)
  if (!nation) throw conflict(CONCORDAT_REFUSALS.notInGame)
  const intent = intentFromBody(nation.id, raw)
  if (!intent) throw conflict(CONCORDAT_ERRORS.unknownIntent)

  // A reader asks for a new board, not too often
  if (intent === CONCORDAT_RESYNC) {
    const last = resyncs.get(accountId) ?? 0
    if (Date.now() - last < RESYNC_COOLDOWN_MS) return IDLE
    resyncs.set(accountId, Date.now())
    await signalPlay(session.id, false, true)

    return IDLE
  }

  // Plain refusals answer at once, the tick checks again
  const refusal = intentRefusal(loop.state, intent) ?? queueIntent(session.id, intent)
  if (refusal) throw conflict(CONCORDAT_REFUSALS[refusal] ?? PLAY_ERRORS.unknownAction)

  return { changed: false, finished: false, deadline: null, isCosmetic: true }
}

// Last board of a finished game, kept in its final snapshot
const endedGameOf = async (
  sessionId: string
): Promise<{ state: ConcordatState; rev: number } | null> => {
  const row = await loadGameRow(sessionId)
  if (!row?.snapshot || row.phase !== ConcordatPhases.Ended) return null

  return { state: importState(decodeMap(row.map), unpackSnapshot(row.snapshot)), rev: row.rev }
}

/**
 * Boards of every reader from one read
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => ConcordatBoard | null>} - Board per reader
 */

export const concordatBoards = async (
  session: EngineSession
): Promise<(viewerId: string) => ConcordatBoard | null> => {
  const loop = loopOf(session.id)
  const source = loop ?? (await endedGameOf(session.id))
  if (!source) return () => null

  const { state, rev } = source
  const shared = sharedBoardOf(state, rev)

  return (viewerId) =>
    boardFor(state, shared, state.players.find((player) => player.accountId === viewerId)?.id ?? 0)
}

/**
 * Board of one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<ConcordatBoard | null>} - Board
 */

export const concordatView = async (
  session: EngineSession,
  viewerId: string
): Promise<ConcordatBoard | null> => (await concordatBoards(session))(viewerId)

export type { ConcordatState }
