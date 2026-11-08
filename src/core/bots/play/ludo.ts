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
    if (board.isOver || board.turnId !== botId) return null
    const at = pauseAfter(latest(now, new Date(board.startsAt)), PLAY_BOT_SETTINGS.ludo.thinkMs)

    // Throw first
    if (board.dice === null) return { key: `roll:${board.rev}`, raw: { type: 'roll' }, at }

    // Best pawn on the board it sees
    const seats = board.players.filter((player) => !player.hasLeft)
    const plan = autoMove(legalMoves(seats, botId, board.dice, board.settings))
    if (!plan) return null

    return { key: `move:${board.rev}`, raw: { type: 'move', pawn: plan.pawn }, at }
  },
}
