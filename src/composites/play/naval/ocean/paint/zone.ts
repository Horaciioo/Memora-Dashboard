import { clamp01 } from '@/composites/play/naval/ocean/paint/frame'
import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'

/**
 * Squares lit for an aim or a placement
 * @typedef {Object} OceanZone
 * @property {Array<{ x: number; y: number }>} cells - Squares
 * @property {'aim' | 'good' | 'bad'} tone - Colour
 */

export interface OceanZone {
  cells: Array<{ x: number; y: number }>
  tone: 'aim' | 'good' | 'bad'
}

// Squares around the pointer that show the grid
const GRID_REACH = 2.5

/**
 * Grid lines near the pointer only, fading out
 * @param {OceanFrame} frame - Frame
 * @param {{ x: number; y: number }} hover - Square under the pointer
 * @return {void}
 */

export const paintNearGrid = (frame: OceanFrame, hover: { x: number; y: number }): void => {
  const { ctx, cell, left, top, size } = frame
  const reach = Math.ceil(GRID_REACH)
  ctx.strokeStyle = NAVAL_WATER.line
  ctx.lineWidth = 1
  for (let y = hover.y - reach; y <= hover.y + reach; y += 1) {
    for (let x = hover.x - reach; x <= hover.x + reach; x += 1) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue
      const distance = Math.hypot(x - hover.x, y - hover.y)
      ctx.globalAlpha = clamp01(1 - distance / GRID_REACH)
      ctx.strokeRect(left + x * cell + 0.5, top + y * cell + 0.5, cell - 1, cell - 1)
    }
  }
  ctx.globalAlpha = 1
}

/**
 * Lit squares of an aim or a ship being placed
 * @param {OceanFrame} frame - Frame
 * @param {OceanZone} zone - Zone
 * @return {void}
 */

export const paintZone = (frame: OceanFrame, zone: OceanZone): void => {
  const { ctx, cell, left, top, now } = frame
  const fill =
    zone.tone === 'bad'
      ? NAVAL_WATER.bad
      : zone.tone === 'good'
        ? NAVAL_WATER.good
        : NAVAL_WATER.zone
  const breath = zone.tone === 'aim' ? 0.85 + 0.15 * Math.sin(now / 180) : 1
  ctx.globalAlpha = breath
  ctx.fillStyle = fill
  for (const { x, y } of zone.cells) ctx.fillRect(left + x * cell, top + y * cell, cell, cell)
  ctx.globalAlpha = 1
  if (zone.tone !== 'aim') return
  ctx.strokeStyle = NAVAL_WATER.zoneEdge
  ctx.lineWidth = Math.max(1.5, cell * 0.06)
  for (const { x, y } of zone.cells)
    ctx.strokeRect(left + x * cell + 1, top + y * cell + 1, cell - 2, cell - 2)
}
