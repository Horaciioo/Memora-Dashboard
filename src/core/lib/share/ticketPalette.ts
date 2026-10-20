/**
 * Colours of the shared ticket image, drawn outside the theme so written as values
 * @type {Record<string, string>}
 */

export const TICKET_PALETTE = {
  canvas: '#f3dfe6',
  ticket: '#fbf4ea',
  stub: '#f6d5df',
  ink: '#3a1b2a',
  subtle: '#7a5566',
  accent: '#b5476a',
  line: '#d9b3c1',
  pill: '#dff0cf',
  pillInk: '#3f6a22',
} as const

/**
 * Colours of the site picture, skeleton bars in the brand tints
 * @type {Record<string, string>}
 */

export const SITE_PALETTE = {
  bars: ['#f2a0ba', '#aed584', '#c9b4ea', '#9cc7ee'],
  window: '#fbf4ea',
  shadow: 'rgba(90, 40, 60, 0.22)',
} as const
