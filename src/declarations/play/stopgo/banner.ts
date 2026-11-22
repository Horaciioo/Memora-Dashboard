/**
 * Dusk road of the Stop & Go hub, card and tile
 * @type {object}
 */

export const STOPGO_BANNER = {
  // Horizon height, share of the frame
  horizon: 0.46,
  // Road half width at the bottom, share of the frame width
  spread: 0.62,
  // Kilometre stone text
  stone: { road: 'N 7', km: '742' },
  // Seconds of the lane dashes rushing by, and of a light cycle
  rush: 1.1,
  light: 6,
  frames: {
    banner: {
      vanish: 1060,
      stone: { x: 1410, y: 640, size: 1.25 },
      light: { x: 1200, y: 250, size: 1.15 },
      sign: { x: 330, y: 460, size: 1.1 },
    },
    card: {
      vanish: 200,
      stone: { x: 300, y: 380, size: 0.6 },
      light: { x: 70, y: 140, size: 0.55 },
      sign: { x: 300, y: 170, size: 0.5 },
    },
    tile: {
      vanish: 470,
      stone: { x: 590, y: 240, size: 0.5 },
      light: { x: 390, y: 80, size: 0.45 },
      sign: { x: 230, y: 130, size: 0.45 },
    },
  },
} as const
