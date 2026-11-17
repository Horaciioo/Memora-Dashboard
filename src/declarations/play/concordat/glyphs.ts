import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

/**
 * Weapons and aircraft with a pictogram of their own
 * @typedef {'missile' | 'heavy' | 'mirv' | 'shell' | 'rocket' | 'heli' | 'fighter'} ConcordatWeaponGlyph
 */

export type ConcordatWeaponGlyph =
  'missile' | 'heavy' | 'mirv' | 'shell' | 'rocket' | 'heli' | 'fighter'

// Aircraft seen from above, nose up
const PLANE_PATH =
  'M12 2 C13 2 13.6 3 13.6 4.5 V9 L21 13.5 V15.5 L13.6 13.2 V18 L16 20 V21.5 L12 20.5 L8 21.5 V20 L10.4 18 V13.2 L3 15.5 V13.5 L10.4 9 V4.5 C10.4 3 11 2 12 2 Z'

/**
 * Weapon and aircraft pictograms on the same grid, drawn upright and turned in the button
 * @type {Record<ConcordatWeaponGlyph, { path: string; turn: number }>}
 */

export const CONCORDAT_WEAPON_GLYPHS: Record<ConcordatWeaponGlyph, { path: string; turn: number }> =
  {
    // Squat shell with a driving band
    shell: {
      turn: 0,
      path: 'M12 2 C15.5 5 16.5 9 16.5 13 V19 H7.5 V13 C7.5 9 8.5 5 12 2 Z M7.5 20.5 H16.5 V22 H7.5 Z',
    },
    // Three small rockets side by side
    rocket: {
      turn: 0,
      path: 'M6 3 C7.2 4.5 7.6 6.5 7.6 9 V14 H4.4 V9 C4.4 6.5 4.8 4.5 6 3 Z M12 6 C13.2 7.5 13.6 9.5 13.6 12 V17 H10.4 V12 C10.4 9.5 10.8 7.5 12 6 Z M18 3 C19.2 4.5 19.6 6.5 19.6 9 V14 H16.4 V9 C16.4 6.5 16.8 4.5 18 3 Z M4.4 15.5 H7.6 V19 H4.4 Z M10.4 18.5 H13.6 V22 H10.4 Z M16.4 15.5 H19.6 V19 H16.4 Z',
    },
    // Helicopter: rotor, cabin, tail boom and skid
    heli: {
      turn: 0,
      path: 'M2 4.5 H22 V6.3 H13 V8.6 C16.6 8.6 19 10.8 19 13.6 V14.4 H22 V16.6 H17.6 C16.8 16.6 16.1 16.2 15.8 15.6 H9 C6 15.6 3.5 13.6 3.5 11.8 C3.5 10 6 8.6 11 8.6 V6.3 H2 Z M4 19.5 H18 V21.3 H4 Z M8 16.5 H9.6 V19.5 H8 Z M13 16.5 H14.6 V19.5 H13 Z',
    },
    fighter: { turn: 0, path: PLANE_PATH },
    // Slim rocket flying up and right
    missile: {
      turn: 45,
      path: 'M12 2 C13.8 4.5 14.5 8 14.5 12 V17 H9.5 V12 C9.5 8 10.2 4.5 12 2 Z M9.5 13 L7 17.5 V19 L9.5 17.5 Z M14.5 13 L17 17.5 V19 L14.5 17.5 Z M10.8 18.2 H13.2 L12 22.5 Z M12 7 m-1.4 0 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0',
    },
    // Three small warheads side by side
    mirv: {
      turn: 0,
      path: 'M12 2 C13.4 4 14 6.5 14 9 V13 H10 V9 C10 6.5 10.6 4 12 2 Z M5 8 C6.2 9.7 6.7 11.6 6.7 13.6 V17 H3.3 V13.6 C3.3 11.6 3.8 9.7 5 8 Z M19 8 C20.2 9.7 20.7 11.6 20.7 13.6 V17 H17.3 V13.6 C17.3 11.6 17.8 9.7 19 8 Z M10 14 H14 L12 19 Z M3.3 18 H6.7 L5 22 Z M17.3 18 H20.7 L19 22 Z',
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
    // Shield with a cross cut out
    post: {
      isStroke: false,
      path: 'M12 2.5 L20 5.5 V11.5 C20 16.5 16.5 20 12 21.5 C7.5 20 4 16.5 4 11.5 V5.5 Z M11 8 H13 V11 H16 V13 H13 V16.5 H11 V13 H8 V11 H11 Z',
    },
    // Radar dish on a mast
    sam: {
      isStroke: false,
      path: 'M3 14 A10 10 0 0 1 13 4 Z M13 7 L21 2.5 L22 4.3 L14.5 9 Z M10.5 11 H12.5 V17 H10.5 Z M6.5 18 H16.5 V21 H6.5 Z',
    },
    // Factory with a sawtooth roof and a chimney
    factory: {
      isStroke: false,
      path: 'M3 21 V11 L8 7.5 V11 L13 7.5 V11 L18 7.5 V4 H20.5 V21 Z M6 15 H9 V18 H6 Z M11 15 H14 V18 H11 Z M16 15 H18 V21 H16 Z',
    },
    // Aircraft over a runway
    airbase: {
      isStroke: false,
      path: 'M12 1.5 C12.8 1.5 13.3 2.3 13.3 3.5 V7 L19 10.5 V12.2 L13.3 10.4 V14 L15.2 15.5 V16.7 L12 15.9 L8.8 16.7 V15.5 L10.7 14 V10.4 L5 12.2 V10.5 L10.7 7 V3.5 C10.7 2.3 11.2 1.5 12 1.5 Z M3 19 H21 V21.5 H3 Z',
    },
    // Field gun on a wheel
    battery: {
      isStroke: false,
      path: 'M5 12.5 L17 4 L19.2 7 L7.2 15.5 Z M3 14 L7.2 11 L9.5 14.3 L5.3 17.3 Z M14 17 a4.2 4.2 0 1 0 8.4 0 a4.2 4.2 0 1 0 -8.4 0 M16.2 17 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    },
  }

/**
 * Stat pictograms of the figures box, same 24 grid
 * @type {Record<'troops', string>}
 */

export const CONCORDAT_STAT_GLYPHS: Record<'troops', string> = {
  // Soldier bust: helmet with brim, face, shoulders
  troops:
    'M6 9 C6 5.5 8.5 3 12 3 C15.5 3 18 5.5 18 9 V10 H6 Z M4.5 10.8 H19.5 V12.6 H4.5 Z M8 13.8 H16 V15.6 C16 17.4 14.2 18.8 12 18.8 C9.8 18.8 8 17.4 8 15.6 Z M3 22 C3 19.8 5.5 19 8.6 18.5 C9.4 19.8 10.6 20.5 12 20.5 C13.4 20.5 14.6 19.8 15.4 18.5 C18.5 19 21 19.8 21 22 Z',
}

/**
 * Single gold coin, fill and rim colours with the embossed mark
 * @type {{ fill: string; rim: string; shine: string; mark: string }}
 */

export const CONCORDAT_COIN = {
  fill: '#F6C443',
  rim: '#C98A12',
  shine: '#FFE9A0',
  mark: 'M12 6.5 L13.4 10.6 L17.7 10.7 L14.3 13.3 L15.5 17.4 L12 15 L8.5 17.4 L9.7 13.3 L6.3 10.7 L10.6 10.6 Z',
}

/**
 * Handshake sealing an alliance, on the same grid
 * @type {string}
 */

export const CONCORDAT_ALLIANCE_GLYPH =
  'M1 8.5 L4.5 7 L6 13.5 L2.5 15 Z M23 8.5 L19.5 7 L18 13.5 L21.5 15 Z M6.8 8 L10 7 L12.5 8.8 L15 7.2 L17.2 8 L16.8 13.6 L13.4 17.4 C12.8 18.1 11.8 18.1 11.3 17.5 L11 17.8 C10.4 18.4 9.4 18.3 8.9 17.6 L8.5 17.9 C7.8 18.3 7 18.1 6.7 17.3 L6.3 12 Z'
