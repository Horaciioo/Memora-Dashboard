/**
 * Cabaret neon of the Suspens hub, card and tile
 * Gallows and figure drawn around the gallows foot at 0 0
 * @type {object}
 */

export const SUSPENS_BANNER = {
  gallows: 'M-120 0H120M-60 0V-360H90V-310',
  // Figure parts, lit one after the other
  figure: [
    'M90 -310m-28 28a28 28 0 1 0 56 0a28 28 0 1 0 -56 0',
    'M90 -254V-150',
    'M90 -230L50 -190M90 -230L130 -190',
    'M90 -150L58 -90M90 -150L122 -90',
  ],
  // Word on the wall, missing letters as blanks
  word: ['S', '', 'S', 'P', '', 'N', 'S'],
  // Seconds of one show
  cycle: 12,
  brick: { width: 96, height: 40 },
  frames: {
    banner: { gallows: { x: 1250, y: 780, scale: 1.4 }, word: { x: 1250, y: 140, size: 64 } },
    card: { gallows: { x: 190, y: 400, scale: 0.75 }, word: { x: 180, y: 70, size: 30 } },
    tile: { gallows: { x: 470, y: 290, scale: 0.6 }, word: { x: 470, y: 50, size: 26 } },
  },
} as const
