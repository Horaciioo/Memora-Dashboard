import 'server-only'

import { botBoards, decideBotMove } from '@/core/engines/play/players/BotPlayer'
import { playersOf } from '@/core/engines/play/players/PlayPlayer'
import { PLAY_BOT_SETTINGS, areBotsAwake } from '@/declarations/play/bots'
import { toAppError } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { botTimerKey, clearDeadline, scheduleDeadline } from '@/core/lib/play/timers'
import { loadSession } from '@/core/services/play/PlaySessionService'
import type { LoadedSession } from '@/core/lib/play/session'
import type { PlayBotMove, PlayPlayer } from '@/types/play'
import { ErrorCodes } from '@/utils/constants/errors'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

// Same path as a human move
type BotAct = (sessionId: string, botId: string, raw: Record<string, unknown>) => Promise<void>

/**
 * Bots of one running table
 * @typedef {Object} BotTable
 */

interface BotTable {
  // Planned move per bot
  plans: Map<string, string>
  // One pass running, one queued
  isDriving: boolean
  isQueued: boolean
  // Moves played one at a time
  turns: Promise<unknown>
  // Passes started, a move that raised one skips its own
  passes: number
  // Refusals of the planned move per bot
  refusals: Map<string, number>
}

// Survives dev hot reloads
const globalForBots = globalThis as unknown as { playBotTables?: Map<string, BotTable> }

const tables = (globalForBots.playBotTables ??= new Map())

/**
 * Bots of a table
 * @param {string} sessionId - Game
 * @return {BotTable} - Table
 */

const tableOf = (sessionId: string): BotTable => {
  const table = tables.get(sessionId) ?? {
    plans: new Map(),
    isDriving: false,
    isQueued: false,
    turns: Promise.resolve(),
    passes: 0,
    refusals: new Map(),
  }
  tables.set(sessionId, table)

  return table
}

/**
 * Forget a table's planned moves, its timers already dropped
 * @param {string} sessionId - Game
 * @return {void}
 */

export const forgetBots = (sessionId: string): void => {
  tables.delete(sessionId)
}

/**
 * Table whose bots this process already drives
 * @param {string} sessionId - Game
 * @return {boolean} - Driven
 */

export const isDriven = (sessionId: string): boolean => tables.has(sessionId)

/**
 * Try a refused move again later, a few times only
 * @param {string} sessionId - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {PlayGameName} game - Game kind
 * @param {BotAct} act - Move path
 * @return {void}
 */

const retryLater = (sessionId: string, bot: PlayPlayer, game: PlayGameName, act: BotAct): void => {
  const { retryMs, retries } = PLAY_BOT_SETTINGS.driver
  const table: BotTable | undefined = tables.get(sessionId)
  if (!table) return
  const count = (table.refusals.get(bot.accountId) ?? 0) + 1
  table.refusals.set(bot.accountId, count)
  // Past the cap the bot waits for the board to move
  if (count > retries) return

  scheduleDeadline(
    botTimerKey(sessionId, bot.accountId),
    new Date(Date.now() + retryMs * count),
    async () => {
      table.plans.delete(bot.accountId)
      await driveBots(sessionId, game, act)
    }
  )
}

/**
 * Play a planned move in turn
 * @param {LoadedSession} session - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {PlayBotMove} move - Planned move
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Played
 */

const playTurn = async (
  session: LoadedSession,
  bot: PlayPlayer,
  move: PlayBotMove,
  act: BotAct
): Promise<void> => {
  // Dropped table, a pause or an end
  const table: BotTable | undefined = tables.get(session.id)
  if (!table) return
  const passes = table.passes
  try {
    await act(
      session.id,
      bot.accountId,
      typeof move.raw === 'function' ? await move.raw() : move.raw
    )
    table.plans.delete(bot.accountId)
    table.refusals.delete(bot.accountId)
  } catch (error) {
    logger.debug('[play] bot move refused', error)
    // A breakdown is replanned now, a refusal later
    if (toAppError(error).code === ErrorCodes.SystemFailure) table.plans.delete(bot.accountId)
    else retryLater(session.id, bot, session.game, act)
  }
  // The move already woke the table, no second pass
  if (table.passes === passes) await driveBots(session.id, session.game, act)
}

/**
 * Plan one bot's next move
 * @param {LoadedSession} session - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {{ view: unknown, act: BotAct }} pass - Shared pass
 * @return {Promise<void>} - Planned
 */

const driveBot = async (
  session: LoadedSession,
  bot: PlayPlayer,
  { view, act }: { view: unknown; act: BotAct }
): Promise<void> => {
  const key = botTimerKey(session.id, bot.accountId)
  const table = tableOf(session.id)
  const move = bot.botKind ? await decideBotMove(session, bot, view) : null

  // Nothing to do, any old plan dropped
  if (!move) {
    clearDeadline(key)
    table.plans.delete(bot.accountId)
    return
  }
  if (table.plans.get(bot.accountId) === move.key) return

  table.plans.set(bot.accountId, move.key)
  table.refusals.delete(bot.accountId)
  scheduleDeadline(key, move.at, async () => {
    const turn = table.turns.then(() => playTurn(session, bot, move, act))
    // A failed turn never blocks the next ones
    table.turns = turn.catch(() => undefined)
    await turn
  })
}

/**
 * One planning pass of a table
 * @param {string} sessionId - Game
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Planned
 */

const drivePass = async (sessionId: string, act: BotAct): Promise<void> => {
  const session = await loadSession(sessionId)
  if (session.status !== PlayStatuses.Running) {
    tables.delete(sessionId)
    return
  }

  const bots = playersOf(session).filter((player) => player.botKind)
  if (!bots.length) {
    tables.delete(sessionId)
    return
  }
  const boardOf = await botBoards(session)
  // One after another, the pool stays free
  for (const bot of bots) await driveBot(session, bot, { view: boardOf(bot.accountId), act })
}

/**
 * Plan the moves of every bot at a table
 * @param {string} sessionId - Game
 * @param {PlayGameName} game - Game kind
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Planned
 */

export const driveBots = async (
  sessionId: string,
  game: PlayGameName,
  act: BotAct
): Promise<void> => {
  // Asleep games stay untouched
  if (!areBotsAwake(game)) return
  const table = tableOf(sessionId)
  table.passes += 1
  // Burst of moves merged
  if (table.isDriving) {
    table.isQueued = true
    return
  }

  table.isDriving = true
  try {
    do {
      table.isQueued = false
      await drivePass(sessionId, act)
    } while (table.isQueued)
  } finally {
    table.isDriving = false
  }
}
