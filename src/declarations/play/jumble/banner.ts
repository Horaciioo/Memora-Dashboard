/**
 * Printer's type case of the Jumble hub, card and tile
 * @type {object}
 */

export const JUMBLE_BANNER = {
  word: 'JUMBLE',
  // Slot of each letter at each beat: two shuffles, then solved
  orders: [
    [3, 0, 5, 1, 4, 2],
    [1, 4, 0, 5, 2, 3],
    [0, 1, 2, 3, 4, 5],
  ],
  // Type case compartments, columns per row
  caseRows: [7, 5, 9, 6],
  // Loose sorts lying in the case
  loose: 'AZERTYUIOPQSDFGHKMWXCVN',
  // Seconds per beat
  beat: 2.6,
  frames: {
    banner: { stick: { x: 880, y: 790, size: 90 }, sortSize: 46 },
    card: { stick: { x: 40, y: 330, size: 46 }, sortSize: 24 },
    tile: { stick: { x: 300, y: 190, size: 44 }, sortSize: 22 },
  },
} as const
