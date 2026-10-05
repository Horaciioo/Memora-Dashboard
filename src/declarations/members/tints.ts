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

/**
 * Colours of the role and function glyphs
 * @type {Record<string, GlyphTint>}
 */

export const GLYPH_TINTS = {
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
  // Live
  LIVE: {
    fillFrom: '#7dd8f5',
    fillTo: '#0aa0d6',
    liftFrom: '#e0f6fd',
    liftTo: '#a5e4f8',
    deepFrom: '#0786b8',
    deepTo: '#0a4e6e',
    cut: '#f1fbfe',
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
    fillFrom: '#efc3cb',
    fillTo: '#c9707f',
    liftFrom: '#fdeff1',
    liftTo: '#f5d5da',
    deepFrom: '#a65768',
    deepTo: '#6a2f3d',
    cut: '#fff6f7',
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
