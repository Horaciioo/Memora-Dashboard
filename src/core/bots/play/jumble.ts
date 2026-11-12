import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, seeded } from '@/core/bots/play/random'
import { wordOfLetters } from '@/core/lib/play/jumble'
import type { jumbleView } from '@/core/services/play/jumble/JumbleViewService'
import { JUMBLE_SETTINGS } from '@/declarations/play'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'

type JumbleBoardView = Awaited<ReturnType<typeof jumbleView>>

/**
 * Jumble bot, reads the word after a pause that grows with its length
 * @type {PlayBotStrategy}
 */

export const JUMBLE_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as JumbleBoardView
    if (board.isOver || board.reveal || !board.scrambled) return null

    // Blank on this word, the bot lets it go
    const turn = `${board.round}:${board.scrambled}`
    const persona = personaOf(botId)
    if (seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.jumble.failRate[level] * persona.sloppy)
      return null

    const word = wordOfLetters(board.scrambled)
    if (!word) return null

    // Longer words take longer to read, a five letter word sets the base
    const { min, max } = PLAY_BOT_SETTINGS.jumble.thinkMs
    const reach = seeded(`${botId}:${turn}:pace`)
    const size = board.length / JUMBLE_SETTINGS.lengths.min

    return {
      key: `guess:${turn}`,
      raw: { type: 'guess', word: word.display },
      at: pauseAfter(latest(now, new Date(board.startsAt)), {
        min: min * persona.pace * size,
        max: (min + (max - min) * reach) * persona.pace * size,
      }),
    }
  },
}
