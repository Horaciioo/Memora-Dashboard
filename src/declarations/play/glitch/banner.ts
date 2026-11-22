/**
 * VHS tube of the Glitch hub, card and tile
 * @type {object}
 */

export const GLITCH_BANNER = {
  // Scanline pitch
  scanline: 4,
  // Bands torn sideways: top, height, jolts in px
  tears: [
    { y: 180, height: 46, jolts: [0, 0, -46, 22, 0, 0, 0, 0] },
    { y: 470, height: 24, jolts: [0, 0, 0, 0, 64, -30, 0, 0] },
    { y: 690, height: 70, jolts: [0, 0, 0, 0, 0, 0, -28, 0] },
  ],
  // Seconds of one tape loop
  cycle: 7,
  timecode: 'PLAY ▶  00:13:07',
  // Twin scenes and the spots that differ, in scene units of 400 by 300
  differences: [
    { x: 300, y: 70, r: 34 },
    { x: 92, y: 214, r: 30 },
    { x: 236, y: 250, r: 26 },
  ],
  frames: {
    banner: {
      scenes: [
        { x: 120, y: 260, scale: 1.05 },
        { x: 1060, y: 260, scale: 1.05 },
      ],
    },
    card: {
      scenes: [
        { x: 40, y: 50, scale: 0.7 },
        { x: 40, y: 260, scale: 0.7 },
      ],
    },
    tile: {
      scenes: [
        { x: 220, y: 40, scale: 0.6 },
        { x: 420, y: 70, scale: 0.6 },
      ],
    },
  },
} as const
