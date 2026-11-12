import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, seeded } from '@/core/bots/play/random'
import type { croquisBotView } from '@/core/services/play/croquis/CroquisViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

type CroquisBotBoard = Awaited<ReturnType<typeof croquisBotView>>

/**
 * Croquis bot, guesses once the drawing had time to show, never draws
 * @type {PlayBotStrategy}
 */

export const CROQUIS_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as CroquisBotBoard
    const me = board.players.find((entry) => entry.accountId === botId)
    if (board.isOver || board.reveal || !me || me.isDrawer || me.rank !== null) return null
    if (!board.secret.word) return null

    // Blank on this drawing, the bot lets it go
    const turn = `${board.round}`
    const persona = personaOf(botId)
    if (seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.croquis.failRate[level] * persona.sloppy)
      return null

    // Never later than the round allows
    const { min, max } = PLAY_BOT_SETTINGS.croquis.thinkMs
    const ceiling = board.settings.roundSeconds * SECOND_MS * 0.9
    const reach = seeded(`${botId}:${turn}:pace`)

    return {
      key: `guess:${turn}`,
      raw: { type: 'guess', word: board.secret.word },
      at: pauseAfter(latest(now, new Date(board.startsAt)), {
        min: Math.min(min * persona.pace, ceiling),
        max: Math.min((min + (max - min) * reach) * persona.pace, ceiling),
      }),
    }
  },
}
