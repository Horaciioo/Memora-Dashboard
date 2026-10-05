import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'

export type ColorVisionMode = 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA'

export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK'

export type FontScale = 'sm' | 'md' | 'lg'

/**
 * Display preference carrying a compact caption beside its full label
 * @typedef {Object} PreferenceOption
 * @property {string} label - Full label
 * @property {string} short - Caption of the segmented control
 * @property {IconName} [icon] - Glyph of its card
 * @property {string} [description] - Line under its card label
 * @property {string} [sample] - Text size of its card sample
 */

interface PreferenceOption {
  label: string
  short: string
  icon?: IconName
  description?: string
  sample?: string
}

/**
 * Colour vision mode
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
  NONE: { label: 'Aucune correction', short: 'Aucune', description: 'Les couleurs d’origine.' },
  PROTANOPIA: {
    label: 'Protanopie',
    short: 'Protanopie',
    description: 'Le rouge se confond avec le vert.',
    attribute: 'protanopia',
  },
  DEUTERANOPIA: {
    label: 'Deutéranopie',
    short: 'Deutéranopie',
    description: 'Le vert se confond avec le rouge.',
    attribute: 'deuteranopia',
  },
  TRITANOPIA: {
    label: 'Tritanopie',
    short: 'Tritanopie',
    description: 'Le bleu se confond avec le jaune.',
    attribute: 'tritanopia',
  },
}

export const COLOR_VISION_REGISTRY = createRegistry(COLOR_VISION_MAP)

/**
 * Theme preferences
 * @type {Record<ThemePreference, PreferenceOption>}
 */

const THEME_MAP: Record<ThemePreference, PreferenceOption> = {
  LIGHT: { label: 'Thème clair', short: 'Clair', icon: 'light' },
  DARK: { label: 'Thème sombre', short: 'Sombre', icon: 'dark' },
  SYSTEM: { label: 'Comme mon appareil', short: 'Auto', icon: 'system' },
}

export const THEME_REGISTRY = createRegistry(THEME_MAP)

/**
 * Text size preferences
 * @type {Record<FontScale, PreferenceOption>}
 */

const FONT_SCALE_MAP: Record<FontScale, PreferenceOption> = {
  sm: { label: 'Petite', short: 'A-', sample: 'text-lg' },
  md: { label: 'Normale', short: 'A', sample: 'text-2xl' },
  lg: { label: 'Grande', short: 'A+', sample: 'text-3xl' },
}

export const FONT_SCALE_REGISTRY = createRegistry(FONT_SCALE_MAP)
