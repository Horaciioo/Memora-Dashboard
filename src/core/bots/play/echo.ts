import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, seeded } from '@/core/bots/play/random'
import type { echoView } from '@/core/services/play/echo/EchoViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'
import { commonSymbol } from '@/core/lib/play/echo'

type EchoBoardView = Awaited<ReturnType<typeof echoView>>

/**
 * Echo bot, spots the shared symbol after a pause
 * @type {PlayBotStrategy}
 */

export const ECHO_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as EchoBoardView
    const hand = board.hands.find((entry) => entry.accountId === botId)
    const me = board.players.find((entry) => entry.accountId === botId)
    if (board.isOver || board.revealUntil || !hand || me?.rank) return null

    // Blank on this round, the bot lets it go
    const turn = `${board.round}:${board.seed}`
    const persona = personaOf(botId)
    if (seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.echo.failRate[level] * persona.sloppy)
      return null

    const symbol = commonSymbol(board.center, hand.card)
    const { min, max } = PLAY_BOT_SETTINGS.echo.thinkMs
    const reach = seeded(`${botId}:${turn}:pace`)

    return {
      key: `pick:${turn}`,
      raw: { type: 'pick', symbol },
      at: pauseAfter(latest(now, new Date(board.startsAt)), {
        min: min * persona.pace,
        max: (min + (max - min) * reach) * persona.pace,
      }),
    }
  },
}
