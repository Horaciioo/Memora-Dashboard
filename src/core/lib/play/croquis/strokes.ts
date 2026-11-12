import { CROQUIS_COLORS, CROQUIS_SETTINGS, CROQUIS_SIZES } from '@/declarations/play'

/**
 * One line of the drawing: pen, nib and the flat list of x, y points
 * @typedef {Object} CroquisStroke
 * @property {number} c - Index of the pen
 * @property {number} w - Index of the nib
 * @property {number[]} p - Points x0, y0, x1, y1, ...
 */

export interface CroquisStroke {
  c: number
  w: number
  p: number[]
}

/**
 * Stroke read from a raw body, clamped into the surface
 * @param {unknown} raw - Sent stroke
 * @return {CroquisStroke | null} - Stroke, null when not one
 */

export const readStroke = (raw: unknown): CroquisStroke | null => {
  if (typeof raw !== 'object' || raw === null) return null
  const { c, w, p } = raw as Record<string, unknown>
  if (!Number.isInteger(c) || !Number.isInteger(w) || !Array.isArray(p)) return null
  if ((c as number) < 0 || (c as number) >= CROQUIS_COLORS.length) return null
  if ((w as number) < 0 || (w as number) >= CROQUIS_SIZES.length) return null

  const { width, height } = CROQUIS_SETTINGS.canvas
  const cap = CROQUIS_SETTINGS.limits.pointsPerStroke * 2
  const points = p
    .slice(0, cap)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  // Pairs only
  const pairs = points.slice(0, points.length - (points.length % 2))
  if (pairs.length < 2) return null

  return {
    c: c as number,
    w: w as number,
    p: pairs.map((value, index) =>
      Math.round(Math.min(index % 2 ? height : width, Math.max(0, value)))
    ),
  }
}

/**
 * Drawing with a stroke put at its place: appended, or replacing the one being drawn
 * @param {CroquisStroke[]} strokes - Strokes so far
 * @param {number} index - Place of the stroke
 * @param {CroquisStroke} stroke - New version of the stroke
 * @return {CroquisStroke[] | null} - New drawing, null when over the limits
 */

export const putStroke = (
  strokes: CroquisStroke[],
  index: number,
  stroke: CroquisStroke
): CroquisStroke[] | null => {
  const { limits } = CROQUIS_SETTINGS
  if (index < 0 || index > strokes.length || index >= limits.strokes) return null

  const next = [...strokes.slice(0, index), stroke, ...strokes.slice(index + 1)]
  const total = next.reduce((sum, entry) => sum + entry.p.length / 2, 0)

  return total > limits.points ? null : next
}
