import type { GolfWall } from '@/core/lib/play/golf/types'

/**
 * Box on the course plane
 * @typedef {Object} GolfBox
 */

export interface GolfBox {
  x0: number
  z0: number
  x1: number
  z1: number
}

/**
 * Uniform grid of static shapes
 * @typedef {Object} GolfGrid
 */

export interface GolfGrid {
  cell: number
  x0: number
  z0: number
  cols: number
  rows: number
  // Shape indexes per cell
  cells: number[][]
}

/**
 * Static shapes of one hole, built once
 * @typedef {Object} GolfColliders
 */

export interface GolfColliders {
  walls: GolfWall[]
  wallGrid: GolfGrid
}

/**
 * First contact of a sweep
 * @typedef {Object} GolfSweepHit
 */

export interface GolfSweepHit {
  // Share of the move, 0 to 1
  t: number
  nx: number
  nz: number
}
