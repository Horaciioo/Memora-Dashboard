/**
 * Staff map of the Concordat hub, card and tile
 * @type {object}
 */

export const CONCORDAT_BANNER = {
  // Ring count of a massif, and the wobble of its outline
  rings: 8,
  wobble: [
    { wave: 3, depth: 0.13 },
    { wave: 5, depth: 0.07 },
    { wave: 9, depth: 0.025 },
  ],
  // Grid step and its edge labels
  grid: 100,
  columns: 'ABCDEFGHIJKLMNOP',
  // Seconds of one conquest, from first border to full hold
  cycle: 26,
  frames: {
    banner: {
      massifs: [
        { x: 400, y: 560, r: 340, seed: 1 },
        { x: 1200, y: 320, r: 380, seed: 2.6 },
        { x: 1380, y: 820, r: 220, seed: 4.1 },
      ],
      factions: [
        { x: 330, y: 520, reach: 360, token: '--concordat-faction-a', delay: 0 },
        { x: 1260, y: 260, reach: 420, token: '--concordat-faction-b', delay: 3 },
        { x: 1340, y: 780, reach: 300, token: '--concordat-faction-c', delay: 6 },
      ],
      march: 'M330 520C520 430 700 420 860 380S1100 300 1260 260',
    },
    card: {
      massifs: [
        { x: 150, y: 300, r: 170, seed: 1.4 },
        { x: 300, y: 110, r: 120, seed: 3.3 },
      ],
      factions: [
        { x: 130, y: 280, reach: 120, token: '--concordat-faction-a', delay: 0 },
        { x: 290, y: 100, reach: 90, token: '--concordat-faction-b', delay: 0 },
      ],
      march: 'M130 280C190 210 240 150 290 100',
    },
    tile: {
      massifs: [
        { x: 420, y: 200, r: 170, seed: 2.1 },
        { x: 600, y: 70, r: 110, seed: 0.7 },
      ],
      factions: [
        { x: 400, y: 190, reach: 130, token: '--concordat-faction-a', delay: 0 },
        { x: 590, y: 70, reach: 80, token: '--concordat-faction-b', delay: 0 },
      ],
      march: 'M400 190C470 140 530 100 590 70',
    },
  },
} as const
