/**
 * Screen-print poster of Bomb Party: hub banner and game card
 * @type {object}
 */

export const BOMB_PRINT = {
  // Wedge ink strength
  rayOpacity: 0.09,
  // Orange plate offset, share of the radius
  register: 0.035,
  banner: {
    bomb: { x: 1270, y: 650, r: 230 },
    rays: 36,
    // Cord from the cap to its loose end across the top
    fuse: 'M1335 418C1390 330 1340 230 1200 196S900 150 760 178S470 250 330 150S120 90 60 130',
    // One lit fuse, shake, blast, new bomb, in seconds
    cycle: 18,
    stamps: [
      { x: 230, y: 250, angle: -9, size: 120, text: 'QU' },
      { x: 520, y: 820, angle: 6, size: 90, text: 'ANT' },
      { x: 1500, y: 260, angle: 12, size: 70, text: 'CH' },
      { x: 120, y: 640, angle: -4, size: 64, text: 'TRA' },
    ],
  },
  card: {
    size: { width: 360, height: 480 },
    bomb: { x: 205, y: 300, r: 112 },
    rays: 28,
    fuse: 'M238 186C262 140 300 118 336 128',
    spark: { x: 336, y: 128 },
    stamp: { x: 128, y: 112, angle: -10, size: 64, text: 'BOUM' },
  },
  // Wide tile of the launcher, the title sits bottom left
  tile: {
    size: { width: 640, height: 320 },
    bomb: { x: 470, y: 200, r: 106 },
    rays: 32,
    fuse: 'M500 92C524 46 566 30 598 44',
    spark: { x: 598, y: 44 },
    stamp: { x: 150, y: 92, angle: -8, size: 58, text: 'BOUM' },
  },
} as const
