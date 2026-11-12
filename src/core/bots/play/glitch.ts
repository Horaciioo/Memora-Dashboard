import 'server-only'

import { personaOf } from '@/core/bots/play/persona'
import { latest, pauseAfter, seeded } from '@/core/bots/play/random'
import type { glitchBotView } from '@/core/services/play/glitch/GlitchViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'

type GlitchBotBoard = Awaited<ReturnType<typeof glitchBotView>>

/**
 * Glitch bot, spots the differences one by one in an order of its own, stalling on some
 * @type {PlayBotStrategy}
 */

export const GLITCH_BOT: PlayBotStrategy = {
  decide: async ({ botId, level, view, now }) => {
    const board = view as GlitchBotBoard
    const me = board.players.find((entry) => entry.accountId === botId)
    if (board.isOver || board.revealUntil || !me || me.rank !== null) return null

    const found = board.secret.found[botId] ?? []
    const turn = `${board.round}:${found.length}`
    const persona = personaOf(botId)
    // Stuck on this one, the bot lets the round run
    if (seeded(`${botId}:${turn}`) < PLAY_BOT_SETTINGS.glitch.failRate[level] * persona.sloppy)
      return null

    // Order of its own, so bots do not all start at the same corner
    const next = board.secret.marks
      .map((mark, index) => ({ mark, index }))
      .filter(({ index }) => !found.includes(index))
      .toSorted(
        (left, right) =>
          seeded(`${botId}:${board.round}:${left.index}`) -
          seeded(`${botId}:${board.round}:${right.index}`)
      )[0]
    if (!next) return null

    const { min, max } = PLAY_BOT_SETTINGS.glitch.thinkMs
    const reach = seeded(`${botId}:${turn}:pace`)
    // A click close to the middle of the difference
    const aim = (axis: string) => (seeded(`${botId}:${turn}:${axis}`) - 0.5) * next.mark.r * 0.7

    return {
      key: `spot:${turn}`,
      raw: { type: 'spot', x: next.mark.x + aim('x'), y: next.mark.y + aim('y') },
      at: pauseAfter(latest(now, new Date(board.startsAt)), {
        min: min * persona.pace,
        max: (min + (max - min) * reach) * persona.pace,
      }),
    }
  },
}
