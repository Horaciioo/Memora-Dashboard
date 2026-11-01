/**
 * One lobe of the brain mark, a box in percent of the whole mark, ordered from left to right
 * @typedef {Object} BrainPiece
 * @property {string} src - Picture of the lobe
 * @property {number} left - Left edge
 * @property {number} top - Top edge
 * @property {number} width - Width
 * @property {number} height - Height
 */

export interface BrainPiece {
  src: string
  left: number
  top: number
  width: number
  height: number
}

/**
 * Width over height of the whole mark
 * @type {number}
 */

export const BRAIN_RATIO = 900 / 1010

/**
 * Lobes of the brain mark
 * @type {BrainPiece[]}
 */

export const BRAIN_PIECES: readonly BrainPiece[] = [
  { src: '/brain/piece-0.png', left: 9.0, top: 11.88, width: 21.11, height: 26.93 },
  { src: '/brain/piece-1.png', left: 2.33, top: 63.86, width: 44.78, height: 36.14 },
  { src: '/brain/piece-2.png', left: 15.78, top: 48.22, width: 29.78, height: 29.31 },
  { src: '/brain/piece-3.png', left: 0.0, top: 0.0, width: 50.11, height: 55.05 },
  { src: '/brain/piece-4.png', left: 50.11, top: 0.0, width: 32.78, height: 32.77 },
  { src: '/brain/piece-5.png', left: 53.0, top: 74.06, width: 29.89, height: 25.94 },
  { src: '/brain/piece-6.png', left: 54.67, top: 48.32, width: 42.67, height: 31.09 },
  { src: '/brain/piece-7.png', left: 52.33, top: 23.27, width: 47.67, height: 31.78 },
]

/**
 * Where a lobe reaches when the membranes stretch, in percent of the lobe box, plus its place left to right
 * @typedef {Object} BrainReach
 * @property {number} x - Horizontal reach
 * @property {number} y - Vertical reach
 * @property {number} order - Place from left (0) to right (1)
 */

export interface BrainReach {
  x: number
  y: number
  order: number
}

// Share of the centre offset a lobe travels at full stretch
const REACH_FACTOR = 0.5

/**
 * Stretch vector of every lobe, away from the centre of the brain
 * @type {BrainReach[]}
 */

export const BRAIN_REACH: readonly BrainReach[] = BRAIN_PIECES.map((piece) => {
  const dx = (piece.left + piece.width / 2 - 50) * REACH_FACTOR
  const dy = (piece.top + piece.height / 2 - 50) * REACH_FACTOR

  return {
    x: Number(((dx / piece.width) * 100).toFixed(2)),
    y: Number(((dy / piece.height) * 100).toFixed(2)),
    order: Number(((piece.left + piece.width / 2) / 100).toFixed(3)),
  }
})
