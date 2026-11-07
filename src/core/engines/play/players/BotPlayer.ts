import 'server-only'

import { PLAY_BOTS } from '@/core/bots/play'
import { toEngineSession } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { engineOf } from '@/core/services/play/PlaySessionService'
import type { PlayBotKindName } from '@/utils/constants/play'
import type { PlayBotMove } from '@/types/play'

/**
 * Next move of a bot, read from its own view
 * @param {LoadedSession} session - Game
 * @param {string} botId - Bot
 * @param {PlayBotKindName} level - Bot level
 * @return {Promise<PlayBotMove | null>} - Move
 */

export const decideBotMove = async (
  session: LoadedSession,
  botId: string,
  level: PlayBotKindName
): Promise<PlayBotMove | null> => {
  const engineSession = toEngineSession(session)
  const view = await engineOf(session.game).view(engineSession, botId)

  return PLAY_BOTS[session.game].decide({
    botId,
    level,
    settings: session.settings,
    view,
    now: new Date(),
  })
}
