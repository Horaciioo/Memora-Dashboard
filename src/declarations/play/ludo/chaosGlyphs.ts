import type { LudoEffectName } from '@/declarations/play/ludo/chaos'

/**
 * Strokes of each Chaos glyph, on a 24 grid
 * @type {Record<string, readonly string[]>}
 */

export const LUDO_CHAOS_GLYPHS = {
  // Sheeted ghost with two eyes
  ghost: ['M5 20V10a7 7 0 0 1 14 0v10l-2.4-2-2.3 2-2.3-2-2.3 2-2.3-2z', 'M9.5 10.5v1M14.5 10.5v1'],
  // Two dice
  double: [
    'M3.5 3.5h9v9h-9z',
    'M11.5 11.5h9v9h-9z',
    'M6.5 6.5h.01M9.5 9.5h.01M14.5 14.5h.01M17.5 17.5h.01',
  ],
  // Chevrons rushing right
  boost: ['M4 5l7 7-7 7', 'M12 5l7 7-7 7'],
  // Two arrows chasing each other
  chameleon: ['M4 12a8 8 0 0 1 14-5.3', 'M20 12a8 8 0 0 1-14 5.3', 'M18 3v4h-4', 'M6 21v-4h4'],
  // Clash bolt
  duel: ['M13 2 5 14h6l-1 8 8-12h-6z'],
  // Cracked die
  faulty: ['M4.5 4.5h15v15h-15z', 'M12 4.5l-2 5 3.5 2.5-3 3 1.5 4.5', 'M7.5 7.5h.01M16.5 16.5h.01'],
  // Power button
  stall: ['M12 3v8', 'M6.3 6.3a8 8 0 1 0 11.4 0'],
  // Crossed-out eye
  blind: [
    'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z',
    'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5',
    'M4 4l16 16',
  ],
  // Card with a star
  joker: [
    'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    'M12 7l1.5 3.2 3.5.4-2.6 2.4.7 3.5-3.1-1.8-3.1 1.8.7-3.5L7 10.6l3.5-.4z',
  ],
} as const satisfies Record<LudoEffectName | 'joker', readonly string[]>

export type LudoGlyphName = keyof typeof LUDO_CHAOS_GLYPHS
