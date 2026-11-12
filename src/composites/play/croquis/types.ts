import type { croquisView } from '@/core/services/play/croquis/CroquisViewService'

// Board sent by the engine
export type CroquisBoardView = Awaited<ReturnType<typeof croquisView>>

export type CroquisSeatView = CroquisBoardView['players'][number]

/**
 * Seat with its face
 * @typedef {Object} CroquisFace
 */

export interface CroquisFace extends CroquisSeatView {
  name: string
  avatarUrl: string | null
}

/**
 * Pen picked by the drawer
 * @typedef {Object} CroquisPen
 * @property {number} color - Index of the colour
 * @property {number} size - Index of the nib
 */

export interface CroquisPen {
  color: number
  size: number
}
