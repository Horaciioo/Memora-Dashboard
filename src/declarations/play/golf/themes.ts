/**
 * Look of each map theme
 * @type {Object}
 */

export const GOLF_THEMES = {
  randomtown: { drift: 'cloud', hasStars: false },
  droppinhit: { drift: 'cloud', hasStars: false },
  zarbland: { drift: 'cloud', hasStars: false },
  slidetown: { drift: 'cloud', hasStars: false },
  singletown: { drift: 'cloud', hasStars: false },
  speedtown: { drift: 'cloud', hasStars: false },
  boingtown: { drift: 'cloud', hasStars: false },
  zigzag: { drift: 'cloud', hasStars: true },
  candy: { drift: 'cloud', hasStars: false },
} as const

export type GolfThemeName = keyof typeof GOLF_THEMES
