/**
 * Gradient stops of one glyph ramp, same shape as the brand one
 * @typedef {Object} GlyphTint
 * @property {string} fillFrom - Body, lit side
 * @property {string} fillTo - Body, shaded side
 * @property {string} liftFrom - Lit facet, lit side
 * @property {string} liftTo - Lit facet, shaded side
 * @property {string} deepFrom - Underside, lit side
 * @property {string} deepTo - Underside, shaded side
 * @property {string} cut - Light cutout
 */

export interface GlyphTint {
  fillFrom: string
  fillTo: string
  liftFrom: string
  liftTo: string
  deepFrom: string
  deepTo: string
  cut: string
}

/**
 * Colours of the role and function glyphs, fixed
 * @type {Record<string, GlyphTint>}
 */

export const GLYPH_TINTS = {
  // Discord, a clear blue
  DISCORD: {
    fillFrom: '#8cc2ff',
    fillTo: '#2f7df0',
    liftFrom: '#e6f2ff',
    liftTo: '#b3d6ff',
    deepFrom: '#2563d6',
    deepTo: '#173f94',
    cut: '#f4f9ff',
  },
  // Live, a clear sky cyan
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
} satisfies Record<string, GlyphTint>
