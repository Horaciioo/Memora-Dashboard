import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import type { ColorVisionMode, FontScale, ThemePreference } from '@/declarations/access/preferences'
import type { DisplayPreferences } from '@/types/auth'
import type { FieldDefinition } from '@/types/forms'
import { ONBOARDING_FIELD_COPY } from '@/declarations/onboarding/copy'
import { toOptions } from '@/core/lib/forms/options'

/**
 * Keep a stored preference only when it still names a declared option
 * @param {string | null} stored - Stored value
 * @param {{ has: (key: string) => boolean }} registry - Registry the value must belong to
 * @return {T | null} - Declared preference
 */

const declared = <T extends string>(
  stored: string | null,
  registry: { has: (key: string) => boolean }
): T | null => (stored && registry.has(stored) ? (stored as T) : null)

/**
 * Read the display preferences a member carries between browsers
 * @param {Object} account - Stored columns
 * @param {string | null} account.theme - Stored theme
 * @param {string | null} account.colorVision - Stored colour vision mode
 * @param {string | null} account.fontScale - Stored text size
 * @return {DisplayPreferences} - Declared preferences
 */

export const toDisplayPreferences = (account: {
  theme: string | null
  colorVision: string | null
  fontScale: string | null
}): DisplayPreferences => ({
  theme: declared<ThemePreference>(account.theme, THEME_REGISTRY),
  colorVision: declared<ColorVisionMode>(account.colorVision, COLOR_VISION_REGISTRY),
  fontScale: declared<FontScale>(account.fontScale, FONT_SCALE_REGISTRY),
})

/**
 * Declarations of the display preference form, shared by the settings and the integration
 * @type {FieldDefinition[]}
 */

export const DISPLAY_FIELDS: FieldDefinition[] = [
  {
    name: 'theme',
    kind: 'select',
    label: ONBOARDING_FIELD_COPY.theme,
    options: toOptions(THEME_REGISTRY),
    span: 'half',
  },
  {
    name: 'fontScale',
    kind: 'select',
    label: ONBOARDING_FIELD_COPY.fontScale,
    options: toOptions(FONT_SCALE_REGISTRY),
    span: 'half',
  },
  {
    name: 'colorVision',
    kind: 'select',
    label: ONBOARDING_FIELD_COPY.colorVision,
    options: toOptions(COLOR_VISION_REGISTRY),
  },
]
