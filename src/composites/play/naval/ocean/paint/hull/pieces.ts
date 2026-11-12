import { NavalPieces } from '@/declarations/play/naval/fleets'
import type { NavalPiece, NavalPieceKind } from '@/declarations/play/naval/fleets'
import type { NavalSkin } from '@/declarations/play/naval/skins'

type Pen = CanvasRenderingContext2D

/**
 * Where a piece stands, in squares
 * @typedef {Object} PiecePlace
 */

export interface PiecePlace {
  x: number
  y: number
  // Half beam of the hull
  half: number
  // Outline width
  line: number
}

// One piece painter
type PiecePainter = (ctx: Pen, skin: NavalSkin, piece: NavalPiece, place: PiecePlace) => void

/**
 * Rounded block with its outline
 * @param {Pen} ctx - Pen
 * @param {number[]} box - Left, top, width, height
 * @param {string[]} colours - Fill then edge
 * @param {number} line - Outline width
 * @return {void}
 */

const block = (ctx: Pen, [x, y, width, height]: number[], [fill, edge]: string[], line: number) => {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, Math.min(width, height) * 0.22)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = edge
  ctx.lineWidth = line
  ctx.stroke()
}

/**
 * Filled disc with its outline
 * @param {Pen} ctx - Pen
 * @param {number[]} at - Centre and radius
 * @param {string[]} colours - Fill then edge
 * @param {number} line - Outline width
 * @return {void}
 */

const disc = (ctx: Pen, [x, y, radius]: number[], [fill, edge]: string[], line: number) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = edge
  ctx.lineWidth = line
  ctx.stroke()
}

// Piece painters by kind, bow towards x
const PAINTERS: Record<NavalPieceKind, PiecePainter> = {
  [NavalPieces.Turret]: (ctx, skin, { size, barrels }, { x, y, line }) => {
    ctx.fillStyle = skin.dark
    for (let index = 0; index < barrels; index += 1) {
      const offset = barrels === 1 ? 0 : (index - (barrels - 1) / 2) * size * 0.5
      ctx.fillRect(x, y + offset - size * 0.05, size * 1.1, size * 0.1)
    }
    disc(ctx, [x, y, size * 0.5], [skin.metal, skin.dark], line)
    ctx.beginPath()
    ctx.arc(x - size * 0.06, y, size * 0.22, 0, Math.PI * 2)
    ctx.fillStyle = skin.top
    ctx.fill()
  },
  [NavalPieces.Bridge]: (ctx, skin, { size }, { x, y, half, line }) => {
    block(ctx, [x - size / 2, y - half * 0.62, size, half * 1.24], [skin.metal, skin.dark], line)
    block(
      ctx,
      [x - size * 0.25, y - half * 0.4, size * 0.42, half * 0.8],
      [skin.top, skin.dark],
      line
    )
    ctx.fillStyle = skin.dark
    ctx.fillRect(x + size * 0.22, y - half * 0.42, line * 1.6, half * 0.84)
  },
  [NavalPieces.Mast]: (ctx, skin, { size }, { x, y, line }) => {
    disc(ctx, [x, y, size * 0.5], [skin.top, skin.dark], line)
    ctx.fillStyle = skin.dark
    ctx.fillRect(x - line / 2, y - size * 0.45, line, size * 0.9)
  },
  [NavalPieces.Vls]: (ctx, skin, { size }, { x, y, line }) => {
    const square = size / 3
    block(ctx, [x - size / 2, y - square, size, square * 2], [skin.metal, skin.dark], line)
    ctx.fillStyle = skin.dark
    for (let column = 0; column < 3; column += 1)
      for (let row = 0; row < 2; row += 1)
        ctx.fillRect(
          x - size / 2 + column * square + square * 0.2,
          y - square + row * square + square * 0.2,
          square * 0.6,
          square * 0.6
        )
  },
  [NavalPieces.Pad]: (ctx, skin, { size }, { x, y, line }) => {
    const radius = size * 0.5
    disc(ctx, [x, y, radius], [skin.deckDark, skin.top], line)
    ctx.fillStyle = skin.top
    ctx.fillRect(x - radius * 0.4, y - radius * 0.45, radius * 0.16, radius * 0.9)
    ctx.fillRect(x + radius * 0.24, y - radius * 0.45, radius * 0.16, radius * 0.9)
    ctx.fillRect(x - radius * 0.3, y - radius * 0.08, radius * 0.6, radius * 0.16)
  },
  [NavalPieces.Heli]: (ctx, skin, { size }, { x, y, line }) => {
    ctx.fillStyle = skin.dark
    ctx.fillRect(x - size * 0.6, y - line / 2, size * 0.5, line)
    block(
      ctx,
      [x - size * 0.22, y - size * 0.14, size * 0.44, size * 0.28],
      [skin.metal, skin.dark],
      line
    )
    ctx.strokeStyle = skin.dark
    ctx.lineWidth = line
    ctx.beginPath()
    ctx.moveTo(x - size * 0.4, y - size * 0.4)
    ctx.lineTo(x + size * 0.4, y + size * 0.4)
    ctx.moveTo(x - size * 0.4, y + size * 0.4)
    ctx.lineTo(x + size * 0.4, y - size * 0.4)
    ctx.stroke()
  },
  [NavalPieces.Plane]: (ctx, skin, { size }, { x, y, line }) => {
    block(
      ctx,
      [x - size * 0.45, y - size * 0.07, size * 0.9, size * 0.14],
      [skin.top, skin.dark],
      line
    )
    block(
      ctx,
      [x - size * 0.12, y - size * 0.42, size * 0.2, size * 0.84],
      [skin.top, skin.dark],
      line
    )
    ctx.fillStyle = skin.accent
    ctx.fillRect(x + size * 0.28, y - size * 0.05, size * 0.1, size * 0.1)
  },
  [NavalPieces.Tower]: (ctx, skin, { size }, { x, y, half, line }) => {
    block(ctx, [x - size / 2, y - half * 0.22, size, half * 0.44], [skin.metal, skin.dark], line)
    block(
      ctx,
      [x - size * 0.2, y - half * 0.13, size * 0.35, half * 0.26],
      [skin.top, skin.dark],
      line
    )
    disc(ctx, [x + size * 0.32, y, half * 0.1], [skin.top, skin.dark], line)
  },
  [NavalPieces.Funnel]: (ctx, skin, { size }, { x, y, line }) => {
    block(ctx, [x - size / 2, y - size * 0.35, size, size * 0.7], [skin.dark, skin.dark], line)
    ctx.fillStyle = skin.shell
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.3, size * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  [NavalPieces.Sail]: (ctx, skin, { size }, { x, y, line }) => {
    ctx.fillStyle = skin.dark
    ctx.fillRect(x - size * 0.05, y - size * 0.32, size * 0.1, size * 0.64)
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.5, size * 0.17, 0, 0, Math.PI * 2)
    ctx.fillStyle = skin.rimDark
    ctx.fill()
    ctx.strokeStyle = skin.dark
    ctx.lineWidth = line
    ctx.stroke()
    ctx.fillStyle = skin.accent
    ctx.fillRect(x - size * 0.3, y - line / 2, size * 0.16, line)
  },
}

/**
 * One piece on the deck
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {NavalPiece} piece - Piece
 * @param {PiecePlace} place - Where it stands
 * @return {void}
 */

export const paintPiece = (ctx: Pen, skin: NavalSkin, piece: NavalPiece, place: PiecePlace): void =>
  PAINTERS[piece.kind](ctx, skin, piece, place)
