import 'server-only'

import { latest, pauseAfter } from '@/core/bots/play/random'
import { autoMove, legalMoves } from '@/core/lib/play/ludo'
import type { ludoView } from '@/core/services/play/ludo/LudoViewService'
import { PLAY_BOT_SETTINGS } from '@/declarations/play/bots'
import type { PlayBotStrategy } from '@/types/play'

type LudoBoardView = Awaited<ReturnType<typeof ludoView>>

/**
 * Ludo bot, the auto move order
 * @type {PlayBotStrategy}
 */

export const LUDO_BOT: PlayBotStrategy = {
  decide: async ({ botId, view, now }) => {
    const board = view as LudoBoardView
    if (board.isOver) return null
    const at = pauseAfter(latest(now, new Date(board.startsAt)), PLAY_BOT_SETTINGS.ludo.thinkMs)

    // A duel: bots on the waiting list throw their own die
    if (board.pending?.type === 'duel') {
      const isWaiting = 'waiting' in board.pending && board.pending.waiting.includes(botId)

      return isWaiting ? { key: `duel:${board.rev}`, raw: { type: 'duelRoll' }, at } : null
    }
    if (board.turnId !== botId) return null

    // Joker kept for the malus, the best die kept of two
    const pending = board.pending
    if (pending?.type === 'joker')
      return { key: `joker:${board.rev}`, raw: { type: 'joker', use: true }, at }
    if (pending?.type === 'pick') {
      const [first, second] = pending.dice ?? [0, 0]

      return { key: `pick:${board.rev}`, raw: { type: 'pick', die: first >= second ? 0 : 1 }, at }
    }

    // Throw first
    if (board.dice === null) return { key: `roll:${board.rev}`, raw: { type: 'roll' }, at }

    // Best pawn on the board it sees
    const seats = board.players
      .filter((player) => !player.hasLeft)
      .map((player) =>
        player.accountId === botId
          ? { ...player, pawns: player.pawns.slice(0, board.settings.pawns) }
          : player
      )
    const plan = autoMove(legalMoves(seats, botId, board.dice, board.settings))
    if (!plan) return null

    return { key: `move:${board.rev}`, raw: { type: 'move', pawn: plan.pawn }, at }
  },
}
