import 'server-only'

import { logger } from '@/core/lib/logger'
import {
  createQueue,
  diffOf,
  drainChanges,
  driveBots,
  drainEvents,
  encodeDiff,
  exportState,
  offerIntent,
  stepTick,
  takeIntents,
} from '@/core/lib/play/concordat'
import type { ConcordatQueue, ConcordatSnapshot } from '@/core/lib/play/concordat'
import { clearDeadline, hasDeadline, scheduleDeadline, timerKey } from '@/core/lib/play/timers'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatEvent, ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatPhases } from '@/utils/constants/concordat'
import type { ConcordatBotLevelName } from '@/utils/constants/concordat'

// Ticks between two diffs
const DIFF_EVERY = Math.max(1, Math.round(CONCORDAT.diffMs / CONCORDAT.tickMs))
// Ticks run at once after a stall, beyond it the clock restarts
const MAX_CATCH_UP = 5
const BEAT_MS = 5000
// Least gap between two board refreshes caused by offers, every reader rebuilds its board
const OFFERS_MS = 1500
// Diffs between two full sends of the slow parts
const SYSTEMS_EVERY = 25
const MAJOR_EVENTS: ConcordatEvent['kind'][] = ['capitalTaken', 'eliminated', 'ended']

/**
 * What the loop needs from the outside
 * @typedef {Object} ConcordatHost
 */

export interface ConcordatHost {
  // Still the owner of the game, false once another process took it
  claim: () => Promise<boolean>
  // Game still running on the Play side
  isOpen: () => Promise<boolean>
  saveSnapshot: (snapshot: ConcordatSnapshot, rev: number) => Promise<void>
  saveEvents: (events: ConcordatEvent[]) => Promise<void>
  publishDiff: (bytes: Uint8Array) => Promise<void>
  // Private offers moved, each reader gets a new board
  signalOffers: () => Promise<void>
  // Scores written, rewards paid
  finish: (state: ConcordatState) => Promise<void>
  // Accounts connected to the game, absent on a host that cannot tell
  connectedAccounts?: () => Promise<ReadonlySet<string>>
}

/**
 * Game kept in memory and ticking
 * @typedef {Object} ConcordatLoop
 */

export interface ConcordatLoop {
  sessionId: string
  state: ConcordatState
  queue: ConcordatQueue
  host: ConcordatHost
  // Revision of the latest diff
  rev: number
  nextAt: number
  lastSnapshotAt: number
  lastBeatAt: number
  lastOffersAt: number
  isSaving: boolean
  events: ConcordatEvent[]
  // Highest tile count per nation
  peak: number[]
  // Nations of humans gone for a while, a caretaker plays them
  away: Set<number>
  // Nations seated by bot accounts
  botNations: ReadonlyMap<number, ConcordatBotLevelName>
  // Tick a human was first seen missing
  missingSince: Map<number, number>
}

// Survives dev hot reloads
const globalForLoops = globalThis as unknown as { concordatLoops?: Map<string, ConcordatLoop> }

const loops = (globalForLoops.concordatLoops ??= new Map())

/**
 * Loop of a game on this process
 * @param {string} sessionId - Game
 * @return {ConcordatLoop | undefined} - Loop
 */

export const loopOf = (sessionId: string): ConcordatLoop | undefined => loops.get(sessionId)

/**
 * Queue a command of a player
 * @param {string} sessionId - Game
 * @param {ConcordatIntent} intent - Command
 * @param {number} [now] - Clock in ms
 * @return {'rate' | 'full' | 'gone' | null} - Refusal
 */

export const queueIntent = (
  sessionId: string,
  intent: ConcordatIntent,
  now = Date.now()
): 'rate' | 'full' | 'gone' | null => {
  const loop = loops.get(sessionId)

  return loop ? offerIntent(loop.queue, intent, now) : 'gone'
}

// Public diff of the changes so far
const flushDiff = (loop: ConcordatLoop, now: number): void => {
  const { state } = loop
  const baseRev = loop.rev
  loop.rev++
  const withSystems = state.isSystemsDirty || loop.rev % SYSTEMS_EVERY === 0
  state.isSystemsDirty = false
  const diff = diffOf({
    state,
    tiles: drainChanges(state),
    events: loop.events.splice(0, loop.events.length),
    rev: loop.rev,
    baseRev,
    withSystems,
  })
  // Still dirty after a skip, the next diff tries again
  if (state.isOffersDirty && now - loop.lastOffersAt >= OFFERS_MS) {
    state.isOffersDirty = false
    loop.lastOffersAt = now
    void loop.host.signalOffers().catch((error: unknown) => {
      logger.warn('[concordat] offers not signalled', error)
    })
  }
  for (const player of state.players)
    loop.peak[player.id] = Math.max(loop.peak[player.id] ?? 0, player.tiles)

  void loop.host.publishDiff(encodeDiff(diff)).catch((error: unknown) => {
    logger.warn('[concordat] diff not sent', error)
  })
}

// Snapshot written off the tick, one at a time
const saveSnapshot = (loop: ConcordatLoop, now: number): void => {
  loop.lastSnapshotAt = now
  if (loop.isSaving) return

  loop.isSaving = true
  void loop.host
    .saveSnapshot(exportState(loop.state), loop.rev)
    .catch((error: unknown) => logger.warn('[concordat] snapshot failed', error))
    .finally(() => {
      loop.isSaving = false
    })
}

/**
 * Stop a loop and forget it
 * @param {string} sessionId - Game
 * @return {void}
 */

export const stopLoop = (sessionId: string): void => {
  clearDeadline(timerKey('tick', sessionId))
  loops.delete(sessionId)
}

// Ownership lost or game closed elsewhere
const checkOwnership = async (loop: ConcordatLoop): Promise<void> => {
  const [isOwner, isOpen] = await Promise.all([loop.host.claim(), loop.host.isOpen()])
  if (isOwner && isOpen) return

  logger.warn(`[concordat] ${loop.sessionId} left by this process`)
  stopLoop(loop.sessionId)
}

// Humans gone long enough are handed to the caretaker, back ones take over again
const refreshAway = async (loop: ConcordatLoop): Promise<void> => {
  const connected = await loop.host.connectedAccounts?.()
  if (!connected) return

  const { state } = loop
  const grace = Math.round((CONCORDAT.bots.awaySeconds * 1000) / CONCORDAT.tickMs)
  for (const player of state.players) {
    if (!player.accountId || !player.alive || loop.botNations.has(player.id)) continue
    if (connected.has(player.accountId)) {
      loop.missingSince.delete(player.id)
      loop.away.delete(player.id)
      continue
    }

    const since = loop.missingSince.get(player.id) ?? state.tick
    loop.missingSince.set(player.id, since)
    if (state.tick - since >= grace) loop.away.add(player.id)
  }
}

// Last writes then the Play side closes the game
const endLoop = async (loop: ConcordatLoop): Promise<void> => {
  stopLoop(loop.sessionId)
  try {
    await loop.host.saveSnapshot(exportState(loop.state), loop.rev)
    await loop.host.finish(loop.state)
  } catch (error) {
    logger.warn('[concordat] end failed', error)
  }
}

/**
 * Run one tick of a loop
 * @param {ConcordatLoop} loop - Loop
 * @param {number} now - Clock in ms
 * @return {void}
 */

export const runTick = (loop: ConcordatLoop, now: number): void => {
  const { state } = loop
  driveBots(state, loop.queue, now, loop.away, loop.botNations)
  stepTick(state, takeIntents(loop.queue))

  // Journal lines wait for the next diff
  const events = drainEvents(state)
  loop.events.push(...events)
  if (events.length)
    void loop.host
      .saveEvents(events)
      .catch((error: unknown) => logger.warn('[concordat] events lost', error))

  if (state.tick % DIFF_EVERY === 0 || state.phase === ConcordatPhases.Ended) flushDiff(loop, now)
  const isMajor = events.some((event) => MAJOR_EVENTS.includes(event.kind))
  if (isMajor || now - loop.lastSnapshotAt >= CONCORDAT.snapshotSeconds * 1000)
    saveSnapshot(loop, now)
  if (now - loop.lastBeatAt >= BEAT_MS) {
    loop.lastBeatAt = now
    void Promise.all([checkOwnership(loop), refreshAway(loop)]).catch((error: unknown) =>
      logger.warn('[concordat] beat failed', error)
    )
  }
  if (state.phase === ConcordatPhases.Ended) void endLoop(loop)
}

// Run due ticks then book the next
const pulse = (loop: ConcordatLoop): void => {
  if (loops.get(loop.sessionId) !== loop) return

  let now = Date.now()
  for (
    let ran = 0;
    loop.nextAt <= now && ran < MAX_CATCH_UP && loops.get(loop.sessionId) === loop;
    ran++
  ) {
    runTick(loop, now)
    loop.nextAt += CONCORDAT.tickMs
    now = Date.now()
  }

  // Too far behind, restart the clock rather than race
  if (loop.nextAt < now - CONCORDAT.tickMs * MAX_CATCH_UP) loop.nextAt = now
  if (loops.get(loop.sessionId) === loop) book(loop)
}

// Book the next pulse
const book = (loop: ConcordatLoop): void =>
  scheduleDeadline(timerKey('tick', loop.sessionId), new Date(loop.nextAt), async () => pulse(loop))

/**
 * Start ticking a game
 * @param {Object} input - Loop input
 * @param {string} input.sessionId - Game
 * @param {ConcordatState} input.state - Game state
 * @param {ConcordatHost} input.host - Outside world
 * @param {number} [input.rev] - Revision to continue from
 * @return {ConcordatLoop} - Loop
 */

export const startLoop = (input: {
  sessionId: string
  state: ConcordatState
  host: ConcordatHost
  rev?: number
  botNations?: ReadonlyMap<number, ConcordatBotLevelName>
}): ConcordatLoop => {
  const now = Date.now()
  const loop: ConcordatLoop = {
    sessionId: input.sessionId,
    state: input.state,
    queue: createQueue(),
    host: input.host,
    rev: input.rev ?? 0,
    nextAt: now + CONCORDAT.tickMs,
    lastSnapshotAt: now,
    lastBeatAt: now,
    lastOffersAt: 0,
    isSaving: false,
    events: [],
    peak: [],
    away: new Set(),
    botNations: input.botNations ?? new Map(),
    missingSince: new Map(),
  }
  loops.set(input.sessionId, loop)
  book(loop)

  return loop
}

/**
 * Tick again after a pause
 * @param {string} sessionId - Game
 * @return {void}
 */

export const wakeLoop = (sessionId: string): void => {
  const loop = loops.get(sessionId)
  if (!loop || hasDeadline(timerKey('tick', sessionId))) return

  loop.nextAt = Date.now() + CONCORDAT.tickMs
  book(loop)
}

/**
 * Save every loop before the process exits
 * @return {Promise<void>} - Saved
 */

export const flushLoops = async (): Promise<void> => {
  await Promise.all(
    [...loops.values()].map((loop) =>
      loop.host.saveSnapshot(exportState(loop.state), loop.rev).catch(() => undefined)
    )
  )
}

// The server entry saves every game on SIGTERM
;(globalThis as unknown as { concordatFlush?: () => Promise<void> }).concordatFlush = flushLoops
