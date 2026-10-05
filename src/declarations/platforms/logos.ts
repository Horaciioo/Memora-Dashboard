import config from '@/configurations/system/plateformes.json'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Logo of a platform
 * @typedef {Object} PlatformLogoOption
 * @property {string} key - Lowercase name
 * @property {string} label - Platform name
 * @property {string | null} path - 24 grid mark
 * @property {string} paint - Brand colour, ink or gradient
 * @property {IconName} [glyph] - Glyph standing in for a missing mark
 */

export interface PlatformLogoOption {
  key: string
  label: string
  path: string | null
  paint: string
  glyph?: IconName
}

/**
 * Every platform Memora shows
 * @type {PlatformLogoOption[]}
 */

export const PLATFORM_LOGOS = config.platforms as PlatformLogoOption[]

/**
 * Gradient of the Instagram mark
 * @type {{ offset: number, colour: string }[]}
 */

export const GRADIENT_STOPS = config.gradient

/**
 * Logo of a declared platform
 * @param {string} name - Declared platform name
 * @return {PlatformLogoOption | null} - Logo when known
 */

export const platformLogoOf = (name: string): PlatformLogoOption | null =>
  PLATFORM_LOGOS.find((logo) => logo.key === name.trim().toLowerCase()) ?? null
