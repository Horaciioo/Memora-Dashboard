import { DECOR_PAINTERS } from '@/composites/play/naval/world/decor'
import { boardOf, frameOf, placeOf } from '@/composites/play/naval/world/geometry'
import type { WorldBoard } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import type { Pen } from '@/composites/play/naval/world/pen'
import { paintBed, paintCloudShadows, paintCrests } from '@/composites/play/naval/world/sea'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'
import type { NavalMapLook } from '@/declarations/play/naval/maps'

/**
 * Seed of a map, the same picture every time
 * @param {string} id - Map key
 * @return {number} - Seed
 */

const seedOf = (id: string): number => [...id].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7) | 0

/**
 * Grid lines over the playable water and its frame
 * @param {Pen} pen - Pen in squares
 * @param {WorldBoard} board - Board
 * @param {NavalMapLook} look - Look
 * @return {void}
 */

const paintGrid = (pen: Pen, board: WorldBoard, look: NavalMapLook): void => {
  const { left, top, size } = board
  const hair = 1 / pen.getTransform().a
  pen.strokeStyle = look.water.grid
  pen.lineWidth = hair * 0.8
  pen.globalAlpha = Math.min(0.9, 10 / size + 0.3)
  pen.beginPath()
  for (let line = 1; line < size; line += 1) {
    pen.moveTo(left + line, top)
    pen.lineTo(left + line, top + size)
    pen.moveTo(left, top + line)
    pen.lineTo(left + size, top + line)
  }
  pen.stroke()
  pen.globalAlpha = 1
  pen.lineWidth = hair * 2
  pen.strokeRect(left, top, size, size)
}

/**
 * Mist drifting over the bands, light over the grid
 * @param {Pen} pen - Pen in squares
 * @param {WorldBoard} board - Board
 * @param {NavalMapLook} look - Look
 * @param {number} seed - Seed
 * @return {void}
 */

const paintMist = (pen: Pen, board: WorldBoard, look: NavalMapLook, seed: number): void => {
  const amount = look.life.mist ?? 0
  if (!amount) return
  const rng = pieceRng(seed + 99)
  const span = Math.max(board.width, board.height)
  for (let wisp = 0; wisp < 12; wisp += 1) {
    const isEdge = wisp % 3 !== 0
    const x = isEdge ? (rng() < 0.5 ? rng() * board.left : board.width - rng() * (board.width - board.left - board.size)) : rng() * board.width
    const y = rng() * board.height
    const radius = span * (0.08 + rng() * 0.12)
    const fog = pen.createRadialGradient(x, y, 0, x, y, radius)
    fog.addColorStop(0, look.water.foam)
    fog.addColorStop(1, 'rgba(0,0,0,0)')
    pen.globalAlpha = amount * (isEdge ? 1.6 : 0.6)
    pen.fillStyle = fog
    pen.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }
  pen.globalAlpha = 1
}

/**
 * Light of the hour and a soft vignette over the whole picture
 * @param {Pen} pen - Pen, no transform
 * @param {NavalMapLook} look - Look
 * @return {void}
 */

const paintAir = (pen: Pen, look: NavalMapLook): void => {
  const { width, height } = pen.canvas
  const [sx, sy] = look.sun
  const light = pen.createLinearGradient(
    width / 2 + sx * width * 0.6,
    height / 2 + sy * height * 0.6,
    width / 2 - sx * width * 0.6,
    height / 2 - sy * height * 0.6
  )
  light.addColorStop(0, look.light.tint)
  light.addColorStop(1, 'rgba(0,0,0,0)')
  pen.fillStyle = light
  pen.fillRect(0, 0, width, height)
  const vignette = pen.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, look.light.shade)
  pen.fillStyle = vignette
  pen.fillRect(0, 0, width, height)
}

/**
 * Whole map drawn into a canvas, the board covering it: water, decor, grid, light
 * @param {HTMLCanvasElement | OffscreenCanvas} canvas - Target, sized already
 * @param {string} id - Map key
 * @return {void}
 */

export const paintMapScene = (canvas: HTMLCanvasElement, id: string): void => {
  const pen = canvas.getContext('2d')
  const map = NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : NAVAL_MAPS.list[0]
  if (!pen) return
  const { look } = map
  const board = boardOf(look, map.theatre.size)
  const fit = frameOf(board, look, canvas.width)
  const seed = seedOf(id)
  paintBed(pen, { board, look, fit, seed })
  pen.setTransform(fit.scale, 0, 0, fit.scale, fit.x, fit.y)
  paintCloudShadows(pen, { board, look, seed })
  paintCrests(pen, { board, look, seed })
  paintGrid(pen, board, look)
  // Far pieces first, the nearest on top
  const pieces = look.decor
    .map((piece, index) => ({ piece, index, place: placeOf(board, look, piece) }))
    .toSorted((a, b) => a.place.y - b.place.y)
  for (const { piece, index, place } of pieces) {
    pen.save()
    DECOR_PAINTERS[piece.kind]({ pen, board, look, piece, place, seed: seed + index * 101 })
    pen.restore()
  }
  paintMist(pen, board, look, seed)
  pen.setTransform(1, 0, 0, 1, 0, 0)
  paintAir(pen, look)
}
