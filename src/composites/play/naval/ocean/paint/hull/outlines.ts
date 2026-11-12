import { NavalOutlines } from '@/declarations/play/naval/fleets'
import type { NavalHull, NavalOutline } from '@/declarations/play/naval/fleets'

// Traces a hull from its stern x, in squares
type Trace = (path: Path2D, x: number, length: number, half: number) => void

// Deck inside the rim: stern inset, length trimmed, share of the beam
type Inset = [number, number, number]

/**
 * Polygon through its points
 * @param {Path2D} path - Path
 * @param {number[][]} points - Corners
 * @return {void}
 */

const polygon = (path: Path2D, points: number[][]): void => {
  points.forEach(([x, y], index) => (index === 0 ? path.moveTo(x, y) : path.lineTo(x, y)))
  path.closePath()
}

// Outline painters by shape
const TRACES: Record<NavalOutline, Trace> = {
  [NavalOutlines.Bow]: (path, x, length, half) => {
    const bow = half * 2.1
    path.moveTo(x + half * 0.6, -half)
    path.lineTo(x + length - bow, -half)
    path.quadraticCurveTo(x + length - bow * 0.3, -half * 0.92, x + length, 0)
    path.quadraticCurveTo(x + length - bow * 0.3, half * 0.92, x + length - bow, half)
    path.lineTo(x + half * 0.6, half)
    path.quadraticCurveTo(x, half, x, 0)
    path.quadraticCurveTo(x, -half, x + half * 0.6, -half)
    path.closePath()
  },
  [NavalOutlines.Facet]: (path, x, length, half) => {
    const bow = half * 2.4
    polygon(path, [
      [x, -half * 0.7],
      [x + half * 0.35, -half],
      [x + length - bow, -half],
      [x + length, 0],
      [x + length - bow, half],
      [x + half * 0.35, half],
      [x, half * 0.7],
    ])
  },
  [NavalOutlines.Armour]: (path, x, length, half) => {
    const bow = half * 1.3
    path.moveTo(x + half * 0.3, -half)
    path.lineTo(x + length - bow, -half)
    path.quadraticCurveTo(x + length, -half, x + length, 0)
    path.quadraticCurveTo(x + length, half, x + length - bow, half)
    path.lineTo(x + half * 0.3, half)
    path.lineTo(x, half * 0.8)
    path.lineTo(x, -half * 0.8)
    path.closePath()
  },
  [NavalOutlines.Carrier]: (path, x, length, half) =>
    polygon(path, [
      [x, -half * 0.85],
      [x + length * 0.62, -half],
      [x + length * 0.9, -half * 0.95],
      [x + length, -half * 0.35],
      [x + length, half * 0.25],
      [x + length * 0.86, half * 0.85],
      [x + length * 0.2, half * 0.9],
      [x, half * 0.7],
    ]),
  [NavalOutlines.Submarine]: (path, x, length, half) => {
    path.moveTo(x + half * 1.2, -half)
    path.lineTo(x + length - half * 1.6, -half)
    path.quadraticCurveTo(x + length, -half, x + length, 0)
    path.quadraticCurveTo(x + length, half, x + length - half * 1.6, half)
    path.lineTo(x + half * 1.2, half)
    path.quadraticCurveTo(x, half * 0.5, x, 0)
    path.quadraticCurveTo(x, -half * 0.5, x + half * 1.2, -half)
    path.closePath()
  },
}

// Deck inset by shape
const INSETS: Record<NavalOutline, Inset> = {
  [NavalOutlines.Bow]: [0.12, 0.3, 0.78],
  [NavalOutlines.Facet]: [0.1, 0.3, 0.8],
  [NavalOutlines.Armour]: [0.08, 0.2, 0.82],
  [NavalOutlines.Carrier]: [0.04, 0.08, 0.92],
  [NavalOutlines.Submarine]: [0.2, 0.4, 0.7],
}

/**
 * Hull and deck paths of a class
 * @typedef {Object} HullPaths
 */

export interface HullPaths {
  rim: Path2D
  deck: Path2D
}

// Paths built once per shape
const paths = new Map<string, HullPaths>()

/**
 * Paths of a class at a length, cached
 * @param {NavalHull} hull - Class
 * @param {number} length - Squares, stern to bow
 * @return {HullPaths} - Rim and deck
 */

export const hullPathsOf = ({ outline, beam }: NavalHull, length: number): HullPaths => {
  const key = `${outline}|${length}|${beam}`
  const known = paths.get(key)
  if (known) return known

  // Rim then the deck inside
  const trace = TRACES[outline]
  const [start, trim, share] = INSETS[outline]
  const rim = new Path2D()
  trace(rim, 0, length, beam / 2)
  const deck = new Path2D()
  trace(deck, start, length - trim, (beam / 2) * share)
  const built = { rim, deck }
  paths.set(key, built)

  return built
}
