/**
 * Look of each map theme
 * @type {Object}
 */

export const GOLF_THEMES = {
  prairie: { drift: 'cloud', hasStars: false },
  canyon: { drift: 'cloud', hasStars: false },
  tropical: { drift: 'cloud', hasStars: false },
  espace: { drift: 'asteroid', hasStars: true },
  plage: { drift: 'cloud', hasStars: false },
} as const

export type GolfThemeName = keyof typeof GOLF_THEMES
