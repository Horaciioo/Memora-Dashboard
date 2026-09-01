import { createRegistry } from '@/core/lib/registry'

export type ColorVisionMode = 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA'

export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK'

export type FontScale = 'sm' | 'md' | 'lg'

/**
 * Display preference carrying a compact caption beside its full label
 * @typedef {Object} PreferenceOption
 * @property {string} label - Full label
 * @property {string} short - Caption of the segmented control
 */

interface PreferenceOption {
  label: string
  short: string
}

/**
 * Colour vision mode, its attribute naming the SVG filter that simulates it
 * @typedef {Object} ColorVisionOption
 * @property {string} label - Full label
 * @property {string} short - Caption of the segmented control
 * @property {string} [attribute] - SVG filter id
 */

interface ColorVisionOption extends PreferenceOption {
  attribute?: string
}

/**
 * Colour vision modes
 * @type {Record<ColorVisionMode, ColorVisionOption>}
 */

const COLOR_VISION_MAP: Record<ColorVisionMode, ColorVisionOption> = {
  NONE: { label: 'Aucune correction', short: 'Aucune' },
  PROTANOPIA: { label: 'Protanopie', short: 'Protanopie', attribute: 'protanopia' },
  DEUTERANOPIA: { label: 'Deutéranopie', short: 'Deutéranopie', attribute: 'deuteranopia' },
  TRITANOPIA: { label: 'Tritanopie', short: 'Tritanopie', attribute: 'tritanopia' },
}

export const COLOR_VISION_REGISTRY = createRegistry(COLOR_VISION_MAP)

/**
 * Theme preferences
 * @type {Record<ThemePreference, PreferenceOption>}
 */

const THEME_MAP: Record<ThemePreference, PreferenceOption> = {
  LIGHT: { label: 'Thème clair', short: 'Clair' },
  DARK: { label: 'Thème sombre', short: 'Sombre' },
  SYSTEM: { label: 'Comme mon appareil', short: 'Auto' },
}

export const THEME_REGISTRY = createRegistry(THEME_MAP)

/**
 * Text size preferences
 * @type {Record<FontScale, PreferenceOption>}
 */

const FONT_SCALE_MAP: Record<FontScale, PreferenceOption> = {
  sm: { label: 'Petite', short: 'A-' },
  md: { label: 'Normale', short: 'A' },
  lg: { label: 'Grande', short: 'A+' },
}

export const FONT_SCALE_REGISTRY = createRegistry(FONT_SCALE_MAP)
