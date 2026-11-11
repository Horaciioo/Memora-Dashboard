import type { WorldBoard, WorldPlace } from '@/composites/play/naval/world/geometry'
import type { Pen } from '@/composites/play/naval/world/pen'
import type { NavalDecor, NavalMapLook } from '@/declarations/play/naval/maps'

/**
 * What a decor painter gets
 * @typedef {Object} DecorScene
 * @property {Pen} pen - Pen, one unit per square
 * @property {number} seed - Seed of the piece
 */

export interface DecorScene {
  pen: Pen
  board: WorldBoard
  look: NavalMapLook
  piece: NavalDecor
  place: WorldPlace
  seed: number
}

// Painter of one decor kind
export type DecorPainter = (scene: DecorScene) => void
