import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import { paintDeckTexture } from '@/composites/play/naval/ocean/paint/hull/decks'
import { hullPathsOf } from '@/composites/play/naval/ocean/paint/hull/outlines'
import { paintPiece } from '@/composites/play/naval/ocean/paint/hull/pieces'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { hullOf, NavalPieces } from '@/declarations/play/naval/fleets'
import type { NavalHull } from '@/declarations/play/naval/fleets'
import type { NavalSkin } from '@/declarations/play/naval/skins'

// Gap left at each end, in squares
const END_GAP = 0.06
// Outline width in squares
const LINE = 0.035
// Squares of a livery or side band
const BAND = 0.12
// Side band from the stern
const SIDE_BAND_AT = 0.1
// Hull share seen above water on a submarine
const SUBMERGED_ALPHA = 0.5

type Pen = CanvasRenderingContext2D

/**
 * Rim and deck shaded across the beam
 * @param {Pen} ctx - Pen
 * @param {Path2D} path - Shape
 * @param {string[]} colours - Lit then shaded
 * @param {number} half - Half beam
 * @return {void}
 */

const shade = (ctx: Pen, path: Path2D, [lit, shaded]: string[], half: number): void => {
  const gradient = ctx.createLinearGradient(0, -half, 0, half)
  gradient.addColorStop(0, lit)
  gradient.addColorStop(1, shaded)
  ctx.fillStyle = gradient
  ctx.fill(path)
}

/**
 * Livery stripes and the side band
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {NavalHull} hull - Class
 * @param {number} length - Squares
 * @return {void}
 */

const paintBands = (ctx: Pen, skin: NavalSkin, hull: NavalHull, length: number): void => {
  const half = hull.beam / 2
  ctx.fillStyle = skin.stripe
  for (const band of hull.bands) ctx.fillRect(band * length - BAND / 2, -half, BAND, hull.beam)
  ctx.fillStyle = skin.accent
  ctx.fillRect(SIDE_BAND_AT, -half, BAND, hull.beam)
}

/**
 * Hull body: rim, bands, deck
 * @param {Pen} ctx - Pen
 * @param {NavalSkin} skin - Skin
 * @param {NavalHull} hull - Class
 * @param {number[]} size - Length and outline width
 * @return {void}
 */

const paintBody = (ctx: Pen, skin: NavalSkin, hull: NavalHull, [length, line]: number[]): void => {
  const half = hull.beam / 2
  const { rim, deck } = hullPathsOf(hull, length)

  // Rim and its bands
  shade(ctx, rim, [skin.rim, skin.rimDark], half)
  ctx.save()
  ctx.clip(rim)
  paintBands(ctx, skin, hull, length)
  ctx.restore()
  ctx.strokeStyle = skin.dark
  ctx.lineWidth = line
  ctx.stroke(rim)

  // Deck and its texture
  shade(ctx, deck, [skin.deck, skin.deckDark], half)
  ctx.save()
  ctx.clip(deck)
  ctx.lineWidth = line * 0.7
  paintDeckTexture(ctx, skin, hull.deck, [length, half])
  ctx.restore()
}

/**
 * One ship drawn in its local frame, stern at zero, bow to the right
 * @param {OceanFrame} frame - Frame
 * @param {NavalShip} ship - Ship
 * @return {void}
 */

export const paintHull = ({ ctx, cell, skin }: OceanFrame, ship: NavalShip): void => {
  const hull = hullOf(skin, ship)
  const length = ship.length - END_GAP * 2
  const line = Math.max(1 / cell, LINE)
  const alpha = ctx.globalAlpha
  ctx.save()
  ctx.scale(cell, cell)
  ctx.translate(END_GAP, 0)

  // Body, faded under water
  if (hull.isSubmerged) ctx.globalAlpha = alpha * SUBMERGED_ALPHA
  paintBody(ctx, skin, hull, [length, line])
  const place = (at: number, across: number) => ({
    x: at * length,
    y: across * (hull.beam / 2),
    half: hull.beam / 2,
    line,
  })
  for (const piece of hull.pieces)
    if (piece.kind !== NavalPieces.Sail) paintPiece(ctx, skin, piece, place(piece.at, piece.across))

  // Sail above the surface
  ctx.globalAlpha = alpha
  for (const piece of hull.pieces)
    if (piece.kind === NavalPieces.Sail) paintPiece(ctx, skin, piece, place(piece.at, piece.across))
  ctx.restore()
}
