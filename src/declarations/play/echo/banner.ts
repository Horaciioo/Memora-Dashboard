/**
 * Glass lenses of the Écho hub, card and tile
 * Symbols sit in lens units, -1 to 1 from the centre
 * @type {object}
 */

export const ECHO_BANNER = {
  // Glyph drawn on a 34 unit box around 0 0
  glyphs: {
    star: 'M0 -17L4.7 -6.5L16.2 -5.3L7.6 2.5L10 13.8L0 8L-10 13.8L-7.6 2.5L-16.2 -5.3L-4.7 -6.5Z',
    drop: 'M0 -16C6 -6 11 0 11 6A11 11 0 0 1 -11 6C-11 0 -6 -6 0 -16Z',
    moon: 'M6 -14A15 15 0 1 0 6 14A11 11 0 1 1 6 -14Z',
    heart: 'M0 14C-14 4 -16 -4 -12 -10C-8 -15 -2 -13 0 -8C2 -13 8 -15 12 -10C16 -4 14 4 0 14Z',
    bolt: 'M3 -16L-9 2H0L-3 16L9 -2H0Z',
    key: 'M-12 -4A6 6 0 1 1 -12 4A6 6 0 1 1 -12 -4ZM-6 -1.5H14V1.5H10V7H7V1.5H-6Z',
  },
  // The symbol both lenses share
  common: 'star',
  lenses: [
    {
      symbols: [
        { glyph: 'star', x: 0.32, y: 0.28, scale: 1.4, angle: 12 },
        { glyph: 'drop', x: -0.42, y: -0.3, scale: 1.1, angle: -18 },
        { glyph: 'moon', x: 0.2, y: -0.52, scale: 0.9, angle: 30 },
        { glyph: 'bolt', x: -0.36, y: 0.46, scale: 1, angle: 8 },
      ],
    },
    {
      symbols: [
        { glyph: 'star', x: -0.34, y: -0.22, scale: 1.2, angle: -20 },
        { glyph: 'heart', x: 0.36, y: -0.4, scale: 1.1, angle: 14 },
        { glyph: 'key', x: 0.3, y: 0.38, scale: 1, angle: -30 },
        { glyph: 'moon', x: -0.3, y: 0.5, scale: 0.8, angle: -60 },
      ],
    },
  ],
  frames: {
    banner: [
      { x: 430, y: 330, r: 290 },
      { x: 1230, y: 600, r: 330 },
    ],
    card: [
      { x: 130, y: 150, r: 112 },
      { x: 236, y: 336, r: 136 },
    ],
    tile: [
      { x: 360, y: 118, r: 98 },
      { x: 530, y: 214, r: 128 },
    ],
  },
  ripple: {
    // Pixels walked before a new ring
    step: 70,
    // Ring life, in ms, and rings alive at once
    life: 1800,
    max: 14,
  },
} as const
