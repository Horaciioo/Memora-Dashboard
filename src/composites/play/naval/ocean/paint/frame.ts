import type { NavalCamera } from '@/core/lib/play/naval/camera'
import type { NavalSkin } from '@/declarations/play/naval/skins'

/**
 * One painted frame of a sea
 * @typedef {Object} OceanFrame
 * @property {CanvasRenderingContext2D} ctx - Pen
 * @property {number} width - Pixels across, the sea is square
 * @property {number} cell - Pixels per square
 * @property {number} left - Pixel of column zero
 * @property {number} top - Pixel of row zero
 * @property {number} size - Squares per side
 * @property {number} now - Clock in milliseconds
 * @property {NavalSkin} skin - Ships and shells
 * @property {number} ratio - Pixel density
 * @property {number} life - Share of the living sea, zero is still
 */

export interface OceanFrame {
  ctx: CanvasRenderingContext2D
  width: number
  cell: number
  left: number
  top: number
  size: number
  now: number
  skin: NavalSkin
  ratio: number
  life: number
}

/**
 * Frame laid over a camera
 * @param {Omit<OceanFrame, 'cell' | 'left' | 'top'>} base - Pen and clock
 * @param {NavalCamera} camera - Camera
 * @return {OceanFrame} - Frame
 */

export const frameOf = (
  base: Omit<OceanFrame, 'cell' | 'left' | 'top'>,
  camera: NavalCamera
): OceanFrame => {
  const cell = base.width / camera.span

  return {
    ...base,
    cell,
    left: -(camera.x - camera.span / 2) * cell,
    top: -(camera.y - camera.span / 2) * cell,
  }
}

/**
 * Pixel centre of a square
 * @param {OceanFrame} frame - Frame
 * @param {number} x - Column
 * @param {number} y - Row
 * @return {{ x: number; y: number }} - Pixels
 */

export const centreOf = (frame: OceanFrame, x: number, y: number) => ({
  x: frame.left + (x + 0.5) * frame.cell,
  y: frame.top + (y + 0.5) * frame.cell,
})

/**
 * Squares in sight, one square of margin
 * @param {OceanFrame} frame - Frame
 * @return {{ x0: number; x1: number; y0: number; y1: number }} - Bounds, inclusive
 */

export const sightOf = ({ left, top, cell, width, size }: OceanFrame) => ({
  x0: Math.max(0, Math.floor(-left / cell) - 1),
  y0: Math.max(0, Math.floor(-top / cell) - 1),
  x1: Math.min(size - 1, Math.ceil((width - left) / cell)),
  y1: Math.min(size - 1, Math.ceil((width - top) / cell)),
})

/**
 * Square in sight
 * @param {OceanFrame} frame - Frame
 * @param {number} x - Column
 * @param {number} y - Row
 * @return {boolean} - Seen
 */

export const isSeen = (frame: OceanFrame, x: number, y: number): boolean => {
  const { x0, x1, y0, y1 } = sightOf(frame)

  return x >= x0 && x <= x1 && y >= y0 && y <= y1
}

/**
 * Stable noise from a seed, zero to one
 * @param {number} seed - Seed
 * @return {number} - Noise
 */

export const noise = (seed: number): number => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453

  return value - Math.floor(value)
}

/**
 * Value held between bounds
 * @param {number} value - Value
 * @param {number} [low] - Floor
 * @param {number} [high] - Ceiling
 * @return {number} - Clamped
 */

export const clamp01 = (value: number, low = 0, high = 1): number =>
  Math.min(high, Math.max(low, value))
