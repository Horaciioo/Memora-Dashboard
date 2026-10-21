/**
 * Gradient stops of one glyph ramp
 * @typedef {Object} GlyphTint
 * @property {string} fillFrom - Body
 * @property {string} fillTo - Body
 * @property {string} [fillMid] - Body middle
 * @property {string} liftFrom - Lit facet
 * @property {string} liftTo - Lit facet
 * @property {string} [liftMid] - Lit middle
 * @property {string} deepFrom - Underside
 * @property {string} deepTo - Underside
 * @property {string} [deepMid] - Underside middle
 * @property {string} cut - Light cutout
 */

export interface GlyphTint {
  fillFrom: string
  fillTo: string
  fillMid?: string
  liftFrom: string
  liftTo: string
  liftMid?: string
  deepFrom: string
  deepTo: string
  deepMid?: string
  cut: string
}

// Original ramps, before the moderator pass
const BASE_TINTS = {
  // Discord
  DISCORD: {
    fillFrom: '#8cc2ff',
    fillTo: '#2f7df0',
    liftFrom: '#e6f2ff',
    liftTo: '#b3d6ff',
    deepFrom: '#2563d6',
    deepTo: '#173f94',
    cut: '#f4f9ff',
  },
  // Live, the green of the Twitch moderator sword
  LIVE: {
    fillFrom: '#6ee36a',
    fillTo: '#00ad03',
    liftFrom: '#e7ffe5',
    liftTo: '#b2f7ae',
    deepFrom: '#008f06',
    deepTo: '#004d0c',
    cut: '#f3fff2',
  },
  ANIMATOR: {
    fillFrom: '#f5c451',
    fillTo: '#c98a1e',
    liftFrom: '#fdf1c7',
    liftTo: '#f3d27a',
    deepFrom: '#9a5b1c',
    deepTo: '#5c3510',
    cut: '#fffaeb',
  },
  RECRUITER: {
    fillFrom: '#2dd4bf',
    fillTo: '#0d9488',
    liftFrom: '#ccfbf1',
    liftTo: '#5eead4',
    deepFrom: '#0f766e',
    deepTo: '#134e4a',
    cut: '#f0fdfa',
  },
  TRAINER: {
    fillFrom: '#4ade80',
    fillTo: '#16a34a',
    liftFrom: '#dcfce7',
    liftTo: '#86efac',
    deepFrom: '#15803d',
    deepTo: '#14532d',
    cut: '#f0fdf4',
  },
  OBSERVER: {
    fillFrom: '#a99cf0',
    fillTo: '#6d5fd0',
    liftFrom: '#ece9fd',
    liftTo: '#c5bdf6',
    deepFrom: '#5a4bb8',
    deepTo: '#352c78',
    cut: '#f6f4ff',
  },
  // Employee, indigo between the red admin and the orange responsable
  EMPLOYE: {
    fillFrom: '#a5b4fc',
    fillTo: '#4f46e5',
    liftFrom: '#e0e7ff',
    liftTo: '#c7d2fe',
    deepFrom: '#4338ca',
    deepTo: '#312e81',
    cut: '#eef2ff',
  },
  // Division escutcheons, orchid for Junior, violet for the squads, gold for the responsables
  DIVISION_JUNIOR: {
    fillFrom: '#d9bff7',
    fillTo: '#8e5bd4',
    liftFrom: '#f3ebfd',
    liftTo: '#dfcbf8',
    deepFrom: '#7a46c2',
    deepTo: '#40226f',
    cut: '#faf5ff',
  },
  DIVISION: {
    fillFrom: '#8b7cf6',
    fillTo: '#5b46d6',
    liftFrom: '#e4e0ff',
    liftTo: '#b6acfa',
    deepFrom: '#4c37b8',
    deepTo: '#2b1f78',
    cut: '#f5f3ff',
  },
  DIVISION_LEAD: {
    fillFrom: '#fcd34d',
    fillTo: '#ea580c',
    liftFrom: '#fff7ed',
    liftTo: '#fdba74',
    deepFrom: '#d9480f',
    deepTo: '#7c2d12',
    cut: '#fffbeb',
  },
  RESPONSABLE: {
    fillFrom: '#fb923c',
    fillTo: '#ea580c',
    liftFrom: '#ffedd5',
    liftTo: '#fdba74',
    deepFrom: '#ea580c',
    deepTo: '#9a3412',
    cut: '#fff7ed',
  },
  ADMIN: {
    fillFrom: '#f87171',
    fillTo: '#dc2626',
    liftFrom: '#fee2e2',
    liftTo: '#fca5a5',
    deepFrom: '#dc2626',
    deepTo: '#991b1b',
    cut: '#fef2f2',
  },
  // Twitch
  TWITCH: {
    fillFrom: '#b794ff',
    fillTo: '#7c3aed',
    liftFrom: '#ede4ff',
    liftTo: '#cdb6ff',
    deepFrom: '#6428c9',
    deepTo: '#3f1a82',
    cut: '#f7f2ff',
  },
  // YouTube
  YOUTUBE: {
    fillFrom: '#ff7a7a',
    fillTo: '#e11d1d',
    liftFrom: '#ffe3e3',
    liftTo: '#ffacac',
    deepFrom: '#c81414',
    deepTo: '#7f0d0d',
    cut: '#fff5f5',
  },
  // News star
  GOLD: {
    fillFrom: '#ffe066',
    fillTo: '#f2b705',
    liftFrom: '#fff8cc',
    liftTo: '#ffeb85',
    deepFrom: '#d99a00',
    deepTo: '#8a5a00',
    cut: '#fffbe6',
  },
  // Live coordinator
  COORDINATOR: {
    fillFrom: '#fcd34d',
    fillTo: '#d97706',
    liftFrom: '#fef3c7',
    liftTo: '#fde68a',
    deepFrom: '#b45309',
    deepTo: '#78350f',
    cut: '#fffbeb',
  },
} satisfies Record<string, GlyphTint>

/**
 * Copy of a ramp with every stop mixed toward one colour
 * @param {GlyphTint} tint - Ramp to shift
 * @param {string} target - Colour to mix toward
 * @param {number} amount - Share of target, 0 to 100
 * @return {GlyphTint} - Shifted ramp
 */

const shift = (tint: GlyphTint, target: string, amount: number): GlyphTint => {
  const mix = (color?: string) =>
    color && `color-mix(in oklab, ${color} ${100 - amount}%, ${target})`
  return {
    fillFrom: mix(tint.fillFrom)!,
    fillMid: mix(tint.fillMid),
    fillTo: mix(tint.fillTo)!,
    liftFrom: mix(tint.liftFrom)!,
    liftMid: mix(tint.liftMid),
    liftTo: mix(tint.liftTo)!,
    deepFrom: mix(tint.deepFrom)!,
    deepMid: mix(tint.deepMid),
    deepTo: mix(tint.deepTo)!,
    cut: tint.cut,
  }
}

/**
 * Paler copy of a ramp
 * @param {GlyphTint} tint - Ramp to lighten
 * @return {GlyphTint} - Lighter ramp
 */

export const lighten = (tint: GlyphTint): GlyphTint => shift(tint, 'white', 55)

/**
 * Slightly darker copy of a ramp
 * @param {GlyphTint} tint - Ramp to deepen
 * @return {GlyphTint} - Darker ramp
 */

export const deepen = (tint: GlyphTint): GlyphTint => shift(tint, 'black', 16)

/**
 * Colours of the role and function glyphs, moderator pass slightly deeper
 * @type {Record<string, GlyphTint>}
 */

export const GLYPH_TINTS = {
  ...BASE_TINTS,
  DISCORD: deepen(BASE_TINTS.DISCORD),
  LIVE: deepen(BASE_TINTS.LIVE),
  ANIMATOR: deepen(BASE_TINTS.ANIMATOR),
} satisfies Record<string, GlyphTint>

/**
 * Junior cord tints, vivid on a black cap
 * @type {Record<string, GlyphTint>}
 */

export const JUNIOR_TINTS = {
  DISCORD_JUNIOR: BASE_TINTS.DISCORD,
  LIVE_JUNIOR: {
    fillFrom: '#b79cff',
    fillTo: '#7c4ddb',
    liftFrom: '#ede4ff',
    liftTo: '#cdb6ff',
    deepFrom: '#6a3dc4',
    deepTo: '#3c2180',
    cut: '#f6f1ff',
  },
  ANIMATOR_JUNIOR: BASE_TINTS.ANIMATOR,
  RESPONSABLE_JUNIOR: {
    fillFrom: '#ff8a3d',
    fillTo: '#ff4d00',
    liftFrom: '#ffe1cc',
    liftTo: '#ffb27a',
    deepFrom: '#e03d00',
    deepTo: '#8f2400',
    cut: '#fff4ec',
  },
} satisfies Record<string, GlyphTint>
