import 'server-only'

import { PLAY_BOTS } from '@/core/bots/play'
import { toEngineSession } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { engineOf } from '@/core/services/play/PlaySessionService'
import type { PlayBotMove, PlayPlayer } from '@/types/play'

/**
 * Board shared by a table's bots
 * @param {LoadedSession} session - Game
 * @return {Promise<unknown>} - Board, undefined when private
 */

export const sharedBotView = (session: LoadedSession): Promise<unknown> =>
  engineOf(session.game).botView?.(toEngineSession(session)) ?? Promise.resolve(undefined)

/**
 * Next move of a bot, read from its own view
 * @param {LoadedSession} session - Game
 * @param {PlayPlayer} bot - Bot seat
 * @param {unknown} shared - Board shared by bots
 * @return {Promise<PlayBotMove | null>} - Move
 */

export const decideBotMove = async (
  session: LoadedSession,
  bot: PlayPlayer,
  shared: unknown
): Promise<PlayBotMove | null> => {
  if (!bot.botKind) return null
  const view =
    shared ?? (await engineOf(session.game).view(toEngineSession(session), bot.accountId))

  return PLAY_BOTS[session.game].decide({
    botId: bot.accountId,
    level: bot.botKind,
    settings: session.settings,
    view,
    now: new Date(),
  })
}
