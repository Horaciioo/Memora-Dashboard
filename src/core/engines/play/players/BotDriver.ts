import 'server-only'

import { decideBotMove } from '@/core/engines/play/players/BotPlayer'
import { playersOf } from '@/core/engines/play/players/PlayPlayer'
import { logger } from '@/core/lib/logger'
import { botTimerKey, clearDeadline, scheduleDeadline } from '@/core/lib/play/timers'
import { loadSession } from '@/core/services/play/PlaySessionService'
import type { LoadedSession } from '@/core/lib/play/session'
import type { PlayPlayer } from '@/types/play'
import { PlayStatuses } from '@/utils/constants/play'

// Same path as a human move
type BotAct = (sessionId: string, botId: string, raw: Record<string, unknown>) => Promise<void>

// Survives dev hot reloads
const globalForBots = globalThis as unknown as { playBotMoves?: Map<string, string> }

// Planned move per bot timer
const planned = (globalForBots.playBotMoves ??= new Map())

/**
 * Plan one bot's next move
 * @param {LoadedSession} session - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Planned
 */

const driveBot = async (session: LoadedSession, bot: PlayPlayer, act: BotAct): Promise<void> => {
  const key = botTimerKey(session.id, bot.accountId)
  const move = bot.botKind ? await decideBotMove(session, bot.accountId, bot.botKind) : null

  // Nothing to do, any old plan dropped
  if (!move) {
    clearDeadline(key)
    planned.delete(key)
    return
  }
  if (planned.get(key) === move.key) return

  planned.set(key, move.key)
  scheduleDeadline(key, move.at, async () => {
    // A refused move waits for the board to change
    try {
      await act(session.id, bot.accountId, move.raw)
      planned.delete(key)
    } catch (error) {
      logger.debug('[play] bot move refused', error)
    }
    await driveBots(session.id, act)
  })
}

/**
 * Plan the moves of every bot at a table
 * @param {string} sessionId - Game
 * @param {BotAct} act - Move path
 * @return {Promise<void>} - Planned
 */

export const driveBots = async (sessionId: string, act: BotAct): Promise<void> => {
  const session = await loadSession(sessionId)
  if (session.status !== PlayStatuses.Running) return

  const bots = playersOf(session).filter((player) => player.botKind)
  await Promise.all(bots.map((bot) => driveBot(session, bot, act)))
}
