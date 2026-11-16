import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

/**
 * Missile pictograms on the same grid, drawn upright and turned in the button
 * @type {Record<'missile' | 'heavy', { path: string; turn: number }>}
 */

export const CONCORDAT_WEAPON_GLYPHS: Record<'missile' | 'heavy', { path: string; turn: number }> =
  {
    // Slim rocket flying up and right
    missile: {
      turn: 45,
      path: 'M12 2 C13.8 4.5 14.5 8 14.5 12 V17 H9.5 V12 C9.5 8 10.2 4.5 12 2 Z M9.5 13 L7 17.5 V19 L9.5 17.5 Z M14.5 13 L17 17.5 V19 L14.5 17.5 Z M10.8 18.2 H13.2 L12 22.5 Z M12 7 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0',
    },
    // Fat warhead with a trefoil hole
    heavy: {
      turn: 0,
      path: 'M12 1.5 C16.5 4.5 17.5 9 17.5 13 V18 H6.5 V13 C6.5 9 7.5 4.5 12 1.5 Z M6.5 14 L2.5 19 V21 L6.5 19.5 Z M17.5 14 L21.5 19 V21 L17.5 19.5 Z M9.5 19 H14.5 L12 23 Z M12 10 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0',
    },
  }

/**
 * Building pictograms on a 24 by 24 grid, filled unless stroked
 * @type {Record<ConcordatBuildingKind, { path: string; isStroke: boolean }>}
 */

export const CONCORDAT_GLYPHS: Record<ConcordatBuildingKind, { path: string; isStroke: boolean }> =
  {
    // Stall with a scalloped awning
    market: {
      isStroke: false,
      path: 'M3 10 L5 4 H19 L21 10 Q21 12 18.5 12 Q16.2 12 16 10.5 Q15.8 12 12 12 Q8.2 12 8 10.5 Q7.8 12 5.5 12 Q3 12 3 10 Z M5 13.5 H19 V20 H5 Z M7.5 15.5 H16.5 V18 H7.5 Z',
    },
    // Tent under a flag
    barracks: {
      isStroke: false,
      path: 'M2 21 L12 8 L22 21 Z M10 21 L12 14 L14 21 Z M11.3 2 H12.7 V9 H11.3 Z M12.7 2.5 H18 L16 4.7 L18 6.9 H12.7 Z',
    },
    // Crenellated tower with a gate
    fortress: {
      isStroke: false,
      path: 'M4 5 H8 V8 H10 V5 H14 V8 H16 V5 H20 V21 H4 Z M10.5 21 V15.5 A1.5 1.5 0 0 1 13.5 15.5 V21 Z',
    },
    // Anchor
    port: {
      isStroke: true,
      path: 'M12 7 V20 M8.5 11 H15.5 M5 14.5 Q6 19.5 12 20 Q18 19.5 19 14.5 M12 7 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    },
    // Upright missile with fins
    silo: {
      isStroke: false,
      path: 'M12 2 C15 5 16 9 16 13 V17 H8 V13 C8 9 9 5 12 2 Z M8 14 L4.5 19 V21 L8 19.5 Z M16 14 L19.5 19 V21 L16 19.5 Z M10.5 18 H13.5 L12 22 Z M12 7 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0',
    },
    // Dome with a slit
    observatory: {
      isStroke: false,
      path: 'M3.5 21 V14 A8.5 8.5 0 0 1 20.5 14 V21 Z M11 5.5 H13 V13 H11 Z',
    },
  }

/**
 * Stat pictograms of the figures box, same 24 grid
 * @type {Record<'troops' | 'gold', string>}
 */

export const CONCORDAT_STAT_GLYPHS: Record<'troops' | 'gold', string> = {
  // Soldier helmet: dome with a crest, brim below
  troops:
    'M11 1.5 H13 V4 H11 Z M4 14.5 C4 8.5 7.4 5 12 5 C16.6 5 20 8.5 20 14.5 Z M2.5 16.5 H21.5 V19 H2.5 Z M6 20.5 H18 V22 H6 Z',
  // Stack of three coins
  gold: 'M4 4 C4 2.6 7.6 1.5 12 1.5 C16.4 1.5 20 2.6 20 4 V6.5 C20 7.9 16.4 8.7 12 8.7 C7.6 8.7 4 7.9 4 6.5 Z M4 11.2 C4 9.8 7.6 8.7 12 8.7 C16.4 8.7 20 9.8 20 11.2 V13.7 C20 15.1 16.4 15.9 12 15.9 C7.6 15.9 4 15.1 4 13.7 Z M4 18.4 C4 17 7.6 15.9 12 15.9 C16.4 15.9 20 17 20 18.4 V20.9 C20 22.3 16.4 23.1 12 23.1 C7.6 23.1 4 22.3 4 20.9 Z',
}

/**
 * Handshake sealing an alliance, on the same grid
 * @type {string}
 */

export const CONCORDAT_ALLIANCE_GLYPH =
  'M1 8.5 L4.5 7 L6 13.5 L2.5 15 Z M23 8.5 L19.5 7 L18 13.5 L21.5 15 Z M6.8 8 L10 7 L12.5 8.8 L15 7.2 L17.2 8 L16.8 13.6 L13.4 17.4 C12.8 18.1 11.8 18.1 11.3 17.5 L11 17.8 C10.4 18.4 9.4 18.3 8.9 17.6 L8.5 17.9 C7.8 18.3 7 18.1 6.7 17.3 L6.3 12 Z'
