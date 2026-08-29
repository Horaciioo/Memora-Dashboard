/**
 * Theme format — the closed vocabulary the visual identity is built from. Every
 * colour, font, radius, shadow and motion step used anywhere resolves to one of
 * these custom properties, whose values live in `src/styles/theme.css` and
 * `src/styles/fonts.css`. The art direction confines itself to this map: a value
 * that is not here is not a legal design token.
 */

export type TokenRef = `var(--${string})`

/**
 * Wrap a custom property name
 * @param {string} name - Property name without the leading dashes
 * @return {TokenRef} - CSS reference
 */

const ref = (name: string): TokenRef => `var(--${name})`

/**
 * Every colour the design may reach for
 * @type {Record<string, TokenRef>}
 */

export const THEME_COLOUR = {
  background: ref('color-background'),
  surface: ref('color-surface'),
  surfaceRaised: ref('color-surface-raised'),
  surfaceSunken: ref('color-surface-sunken'),
  ink: ref('color-ink'),
  inkSubtle: ref('color-ink-subtle'),
  inkAccent: ref('color-ink-accent'),
  border: ref('color-border'),
  borderStrong: ref('color-border-strong'),
  brand: ref('color-brand-600'),
  brandEdge: ref('color-brand-400'),
  brandSoft: ref('color-brand-soft'),
  onBrand: ref('color-on-brand'),
  success: ref('color-success'),
  caution: ref('color-caution'),
  warning: ref('color-warning'),
  danger: ref('color-danger'),
  info: ref('color-info'),
  neutral: ref('color-neutral'),
  successSoft: ref('color-success-soft'),
  cautionSoft: ref('color-caution-soft'),
  warningSoft: ref('color-warning-soft'),
  dangerSoft: ref('color-danger-soft'),
  infoSoft: ref('color-info-soft'),
  neutralSoft: ref('color-neutral-soft'),
} as const

/**
 * The three families, title to label
 * @type {Record<string, TokenRef>}
 */

export const THEME_FONT = {
  display: ref('font-display'),
  body: ref('font-body'),
  mono: ref('font-mono'),
} as const

/**
 * Corner rounding steps
 * @type {Record<string, TokenRef>}
 */

export const THEME_RADIUS = {
  sm: ref('radius-sm'),
  md: ref('radius-md'),
  lg: ref('radius-lg'),
  xl: ref('radius-xl'),
  full: ref('radius-full'),
} as const

/**
 * Elevation steps, reserved for floating surfaces
 * @type {Record<string, TokenRef>}
 */

export const THEME_SHADOW = {
  sm: ref('shadow-sm'),
  md: ref('shadow-md'),
  lg: ref('shadow-lg'),
} as const

/**
 * Motion durations and easing
 * @type {Record<string, TokenRef>}
 */

export const THEME_MOTION = {
  fast: ref('motion-duration-fast'),
  moderate: ref('motion-duration-moderate'),
  panel: ref('motion-duration-panel'),
  easeOut: ref('motion-ease-out'),
} as const

/**
 * The whole format, grouped
 * @type {Record<string, Record<string, TokenRef>>}
 */

export const THEME = {
  colour: THEME_COLOUR,
  font: THEME_FONT,
  radius: THEME_RADIUS,
  shadow: THEME_SHADOW,
  motion: THEME_MOTION,
} as const

/**
 * Build a Tailwind arbitrary-value class from a token
 * @param {string} property - Utility prefix, e.g. bg or text
 * @param {TokenRef} token - Token reference
 * @return {string} - Utility class
 */

export const tw = (property: string, token: TokenRef): string => `${property}-[${token}]`
