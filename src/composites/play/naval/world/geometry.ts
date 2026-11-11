import type { Lift } from '@/composites/play/naval/world/pen'
import type { NavalDecor, NavalMapLook } from '@/declarations/play/naval/maps'

// Height of the eye over the board, in board spans
const EYE = 0.85
// Lean towards the south, shows the fronts
const TOWARDS_VIEWER = 0.32

/**
 * Whole board in squares: the grid and its decor band
 * @typedef {Object} WorldBoard
 * @property {number} width - Squares across
 * @property {number} height - Squares down
 * @property {number} left - First grid column
 * @property {number} top - First grid row
 * @property {number} size - Grid squares per side
 */

export interface WorldBoard {
  width: number
  height: number
  left: number
  top: number
  size: number
}

/**
 * Where a decor piece stands
 * @typedef {Object} WorldPlace
 * @property {number} x - Centre column on the board
 * @property {number} y - Centre row on the board
 * @property {number} room - Band depth around it, in squares
 * @property {number} span - Room along its side, in squares
 * @property {boolean} isAcross - The side runs across, north or south
 */

export interface WorldPlace {
  x: number
  y: number
  room: number
  span: number
  isAcross: boolean
}

/**
 * Board of a map
 * @param {NavalMapLook} look - Look
 * @param {number} size - Grid size
 * @return {WorldBoard} - Board
 */

export const boardOf = ({ band }: NavalMapLook, size: number): WorldBoard => ({
  width: band.west + size + band.east,
  height: band.north + size + band.south,
  left: band.west,
  top: band.north,
  size,
})

/**
 * Centre of a piece, along its side and across its band
 * @param {WorldBoard} board - Board
 * @param {NavalMapLook} look - Look
 * @param {NavalDecor} piece - Piece
 * @return {WorldPlace} - Place
 */

export const placeOf = (board: WorldBoard, { band }: NavalMapLook, piece: NavalDecor): WorldPlace => {
  const { left, top, size } = board
  const corners: Record<string, [number, number]> = {
    northwest: [band.west, band.north],
    northeast: [band.east, band.north],
    southwest: [band.west, band.south],
    southeast: [band.east, band.south],
  }
  if (piece.side in corners) {
    const [across, down] = corners[piece.side]
    const isEast = piece.side.endsWith('east')
    const isSouth = piece.side.startsWith('south')

    return {
      x: isEast ? left + size + across * piece.depth : left - across * piece.depth,
      y: isSouth ? top + size + down * piece.depth : top - down * piece.depth,
      room: Math.min(across, down),
      span: Math.min(across, down),
      isAcross: true,
    }
  }
  const room = band[piece.side as keyof typeof band]
  const along = piece.at * size
  // Distance from the grid edge, into the band
  const off = piece.depth * room
  const sides = {
    north: { x: left + along, y: top - off },
    south: { x: left + along, y: top + size + off },
    west: { x: left - off, y: top + along },
    east: { x: left + size + off, y: top + along },
  }
  const { x, y } = sides[piece.side as keyof typeof sides]

  return { x, y, room, span: size, isAcross: piece.side === 'north' || piece.side === 'south' }
}

/**
 * Pixels per square and offset of a square picture: a span of squares around the board centre,
 * pulled towards the first decor piece, the open sea beyond the board drawn too
 * @param {WorldBoard} board - Board
 * @param {NavalMapLook} look - Look
 * @param {number} pixels - Picture side
 * @return {{ scale: number; x: number; y: number }} - Transform
 */

export const frameOf = (board: WorldBoard, look: NavalMapLook, pixels: number) => {
  const span = Math.min(look.preview.span, Math.max(board.width, board.height))
  const centre = { x: board.width / 2, y: board.height / 2 }
  const lead = look.decor[0] ? placeOf(board, look, look.decor[0]) : centre
  const x = centre.x + (lead.x - centre.x) * look.preview.focus
  const y = centre.y + (lead.y - centre.y) * look.preview.focus
  const scale = pixels / span

  return { scale, x: pixels / 2 - x * scale, y: pixels / 2 - y * scale }
}

/**
 * Shift of a solid's top: away from the board centre, as seen from above, and a little north
 * @param {WorldBoard} board - Board
 * @param {number} x - Column of the solid
 * @param {number} y - Row of the solid
 * @param {number} height - Squares high
 * @return {Lift} - Shift in squares
 */

export const liftOf = (board: WorldBoard, x: number, y: number, height: number): Lift => {
  const eye = Math.max(board.width, board.height) * EYE

  return [
    ((x - board.width / 2) * height) / eye,
    ((y - board.height / 2) * height) / eye - height * TOWARDS_VIEWER,
  ]
}
