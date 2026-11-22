/**
 * Night sea chart of the Bataille navale hub, card and tile
 * @type {object}
 */

export const NAVAL_BANNER = {
  // Rhumb lines out of the rose, and grid cells
  rhumbs: 32,
  cell: 90,
  columns: 'ABCDEFGHIJKLMNOPQR',
  // Seconds of one sonar turn, and the swell drift
  sweep: 7,
  swell: 9,
  // Depth soundings scattered on the chart
  soundings: [
    { x: 160, y: 140, depth: 42 },
    { x: 380, y: 260, depth: 37 },
    { x: 610, y: 120, depth: 55 },
    { x: 260, y: 520, depth: 29 },
    { x: 520, y: 700, depth: 61 },
    { x: 840, y: 820, depth: 48 },
    { x: 1500, y: 140, depth: 33 },
    { x: 1460, y: 420, depth: 70 },
    { x: 980, y: 210, depth: 26 },
  ],
  frames: {
    banner: {
      rose: { x: 1180, y: 560, r: 300 },
      reach: 640,
      ships: [
        { x: 920, y: 380, length: 5, angle: -18 },
        { x: 1420, y: 700, length: 4, angle: 30 },
        { x: 1300, y: 300, length: 3, angle: 80 },
        { x: 960, y: 760, length: 2, angle: -50 },
      ],
    },
    card: {
      rose: { x: 180, y: 290, r: 120 },
      reach: 260,
      ships: [
        { x: 90, y: 150, length: 4, angle: -20 },
        { x: 280, y: 410, length: 3, angle: 35 },
      ],
    },
    tile: {
      rose: { x: 480, y: 170, r: 110 },
      reach: 240,
      ships: [
        { x: 330, y: 80, length: 4, angle: -12 },
        { x: 590, y: 270, length: 3, angle: 28 },
      ],
    },
  },
} as const
