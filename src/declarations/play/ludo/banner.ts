/**
 * Lacquered board of the Ludo hub, card and tile, seen in isometric
 * Board cells go 0 to 15 on both axes
 * @type {object}
 */

export const LUDO_BANNER = {
  size: 15,
  // Home corner of each colour: first cell and token
  homes: [
    { u: 0, v: 0, token: '--play-ludo-red' },
    { u: 9, v: 0, token: '--play-ludo-blue' },
    { u: 9, v: 9, token: '--play-ludo-yellow' },
    { u: 0, v: 9, token: '--play-ludo-green' },
  ],
  // Cells the red pawn hops through, in board units
  hops: [
    [6, 13],
    [6, 12],
    [6, 11],
    [6, 10],
    [6, 9],
    [5, 8],
    [4, 8],
  ],
  // Pawns resting on the board
  pawns: [
    { u: 2, v: 2, token: '--play-ludo-red' },
    { u: 12, v: 3, token: '--play-ludo-blue' },
    { u: 11, v: 12, token: '--play-ludo-yellow' },
    { u: 3, v: 11, token: '--play-ludo-green' },
    { u: 8, v: 4, token: '--play-ludo-blue' },
  ],
  // Seconds of a roll and its walk
  cycle: 8,
  frames: {
    banner: { x: 1300, y: 200, cell: 36, die: { x: 380, y: 700 } },
    card: { x: 180, y: 120, cell: 20, die: { x: 300, y: 420 } },
    tile: { x: 470, y: 40, cell: 18, die: { x: 180, y: 220 } },
  },
} as const
