import { drawSprite, spriteWidth } from '@/composites/play/concordat/board/draw/pixelSprite'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import type { ConcordatSpriteName } from '@/declarations/play/concordat/sprites'
import { ConcordatShipKinds } from '@/utils/constants/concordat'
import type { ConcordatShipKind } from '@/utils/constants/concordat'

const { boat, sprite } = CONCORDAT_ART

/**
 * Sprite of a moving unit
 * @param {ConcordatShipKind} kind - Unit kind
 * @return {ConcordatSpriteName} - Sprite
 */

export const spriteOf = (kind: ConcordatShipKind): ConcordatSpriteName =>
  kind === ConcordatShipKinds.War
    ? 'war'
    : kind === ConcordatShipKinds.Trade
      ? 'trade'
      : 'transport'

/**
 * Screen pixels of one sprite pixel at a zoom
 * @param {number} scale - Screen pixels of a map tile
 * @return {number} - Pixels
 */

export const pixelAt = (scale: number): number =>
  Math.max(sprite.minPixel, Math.round(scale * sprite.perScale * 2) / 2)

/**
 * Length of a unit on screen
 * @param {ConcordatShipKind} kind - Unit kind
 * @param {number} pixel - Screen pixels of one sprite pixel
 * @return {number} - Pixels
 */

export const lengthOf = (kind: ConcordatShipKind, pixel: number): number =>
  spriteWidth(spriteOf(kind)) * pixel * (kind === ConcordatShipKinds.Trade ? sprite.tradeGrow : 1)

/**
 * Pixel boat in the colour of its nation, with a short pixel wake on the water
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {number} x - Centre in pixels
 * @param {number} y - Centre in pixels
 * @param {number} pixel - Screen pixels of one sprite pixel
 * @param {number} angle - Heading in radians, zero looks right
 * @param {readonly number[]} color - Nation colour
 * @param {ConcordatShipKind} kind - Unit kind
 * @param {number} now - Clock in ms
 * @param {number} seed - Offsets the bob of one boat from another
 * @param {boolean} [isMoving] - Draws a wake behind
 * @return {void}
 */

export const drawUnit = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixel: number,
  angle: number,
  color: readonly number[],
  kind: ConcordatShipKind,
  now: number,
  seed: number,
  isMoving = false
): void => {
  const name = spriteOf(kind)
  // A cargo boat is a small cross, a few of them make a sea lane
  const unit = kind === ConcordatShipKinds.Trade ? pixel * sprite.tradeGrow : pixel
  const isCross = kind === ConcordatShipKinds.Trade
  const length = lengthOf(kind, pixel)
  const bob = Math.round(Math.sin(now / boat.bobMs + seed)) * pixel * 0.5

  if (isMoving && !isCross) {
    // Wake: square foam pixels shrinking behind the stern
    context.save()
    context.translate(x, y)
    context.rotate(angle)
    for (let index = 0; index < 4; index++) {
      const drift = (((now / boat.wakeMs + index / 4 + seed * 0.13) % 1) + 1) % 1
      context.fillStyle = rgbText(boat.wake, 0.8 * (1 - drift))
      const side = (index % 2 ? 1 : -1) * pixel * 0.9 * (0.4 + drift)
      const grain = Math.max(1, pixel * (1 - drift * 0.5))
      context.fillRect(-length * 0.5 - drift * length * 0.6, side - grain / 2, grain, grain)
    }
    context.restore()
  } else if (!isCross) {
    // Shadow on the water
    context.fillStyle = rgbText(boat.shadow, 0.25)
    context.fillRect(x - length / 2, y + pixel * 1.5, length, pixel)
  }
  drawSprite(context, name, color, x, y + bob, unit, isCross ? 0 : angle)
}
