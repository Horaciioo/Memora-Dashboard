import type { WorldBoard, WorldPlace } from '@/composites/play/naval/world/geometry'
import type { Pen } from '@/composites/play/naval/world/pen'
import type { NavalDecor, NavalMapLook } from '@/declarations/play/naval/maps'

// How a living light moves
export type DecorLightBeat = 'blink' | 'flicker' | 'pulse'

/**
 * Light a piece leaves for the living layer
 * @typedef {Object} DecorLight
 * @property {number} x - Column on the board
 * @property {number} y - Row on the board
 * @property {number} radius - Glow radius, in squares
 */

export interface DecorLight {
  x: number
  y: number
  radius: number
  colour: string
  beat: DecorLightBeat
}

/**
 * What a decor painter gets
 * @typedef {Object} DecorScene
 * @property {Pen} pen - Pen, one unit per square
 * @property {number} seed - Seed of the piece
 * @property {(light: DecorLight) => void} [light] - Keeps a light for the living layer
 */

export interface DecorScene {
  pen: Pen
  board: WorldBoard
  look: NavalMapLook
  piece: NavalDecor
  place: WorldPlace
  seed: number
  light?: (light: DecorLight) => void
}

// Painter of one decor kind
export type DecorPainter = (scene: DecorScene) => void
