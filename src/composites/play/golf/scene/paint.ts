import { Color } from 'three'

import {
  GOLF_COURSE_PAINT,
  GOLF_PAINT_PREFIX,
  GOLF_SHARED_PAINT,
  GOLF_TURF_PAINT,
} from '@/declarations/play/golf/paint'
import type { GolfPaintKey } from '@/declarations/play/golf/paint'

export type GolfPaint = Record<GolfPaintKey, Color>

/**
 * Colour of a token, read on the page
 * @param {CSSStyleDeclaration} style - Computed page style
 * @param {string} token - CSS variable
 * @return {Color} - Colour
 */

const colorOf = (style: CSSStyleDeclaration, token: string): Color =>
  new Color(style.getPropertyValue(token).trim() || undefined)

/**
 * Every colour of a course, from its tokens
 * @param {string} coursePaint - Course token prefix
 * @return {GolfPaint} - Colours
 */

export const readPaint = (coursePaint: string): GolfPaint => {
  const style = getComputedStyle(document.documentElement)
  const paint = Object.fromEntries([
    ...GOLF_COURSE_PAINT.map((key) => [key, colorOf(style, `${coursePaint}-${key}`)]),
    ...GOLF_SHARED_PAINT.map((key) => [key, colorOf(style, `${GOLF_PAINT_PREFIX}-${key}`)]),
  ]) as GolfPaint

  // Obstacles and bumpers wear the turf
  for (const [key, { toward, amount }] of Object.entries(GOLF_TURF_PAINT))
    paint[key as keyof typeof GOLF_TURF_PAINT] = paint.turf.clone().lerp(paint[toward], amount)

  return paint
}

/**
 * Colour of a seat token
 * @param {string} color - Seat colour key
 * @return {Color} - Colour
 */

export const seatColor = (color: string): Color =>
  colorOf(getComputedStyle(document.documentElement), `--play-${color}`)
