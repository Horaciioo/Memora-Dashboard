import type { bombView } from '@/core/services/play/bomb/BombViewService'

// Board sent by the engine
export type BombBoardView = Awaited<ReturnType<typeof bombView>>

export type BombSeatView = BombBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} BombFace
 */

export interface BombFace extends BombSeatView {
  name: string
  avatarUrl: string | null
}
