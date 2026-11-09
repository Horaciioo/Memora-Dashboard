import 'server-only'

import { decideBotMove, sharedBotView } from '@/core/engines/play/players/BotPlayer'
import { playersOf } from '@/core/engines/play/players/PlayPlayer'
import { toAppError } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { botTimerKey, clearDeadline, scheduleDeadline } from '@/core/lib/play/timers'
import { loadSession } from '@/core/services/play/PlaySessionService'
import type { LoadedSession } from '@/core/lib/play/session'
import type { PlayBotMove, PlayPlayer } from '@/types/play'
import { ErrorCodes } from '@/utils/constants/errors'
import { PlayStatuses } from '@/utils/constants/play'

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
  }
  tables.set(sessionId, table)

  return table
}

/**
 * Play a planned move in turn
 * @param {string} sessionId - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {PlayBotMove} move - Planned move
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Played
 */

const playTurn = async (
  sessionId: string,
  bot: PlayPlayer,
  move: PlayBotMove,
  act: BotAct
): Promise<void> => {
  const { plans } = tableOf(sessionId)
  try {
    await act(
      sessionId,
      bot.accountId,
      typeof move.raw === 'function' ? await move.raw() : move.raw
    )
    plans.delete(bot.accountId)
  } catch (error) {
    logger.debug('[play] bot move refused', error)
    // A breakdown is retried, a refusal waits
    if (toAppError(error).code === ErrorCodes.SystemFailure) plans.delete(bot.accountId)
  }
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
  scheduleDeadline(key, move.at, async () => {
    const turn = table.turns.then(() => playTurn(session.id, bot, move, act))
    table.turns = turn
    await turn
    await driveBots(session.id, act)
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
  if (!bots.length) return
  const view = await sharedBotView(session)
  // One after another, the pool stays free
  for (const bot of bots) await driveBot(session, bot, { view, act })
}

/**
 * Plan the moves of every bot at a table
 * @param {string} sessionId - Game
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Planned
 */

export const driveBots = async (sessionId: string, act: BotAct): Promise<void> => {
  const table = tableOf(sessionId)
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
