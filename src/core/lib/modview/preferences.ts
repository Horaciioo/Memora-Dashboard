import { MODVIEW_PREFERENCES } from '@/declarations/modview/preferences'
import type { PreferenceDefinition } from '@/declarations/modview/preferences'
import type { ModPreferences } from '@/types/modview'

/**
 * Defaults of every preference
 * @type {ModPreferences}
 */

export const MODVIEW_DEFAULTS = Object.fromEntries(
  Object.entries(MODVIEW_PREFERENCES).map(([name, rule]) => [name, rule.default])
) as unknown as ModPreferences

// Value the rule accepts
const isValid = (rule: PreferenceDefinition, value: unknown): boolean =>
  rule.kind === 'toggle'
    ? typeof value === 'boolean'
    : typeof value === 'string' && rule.options.includes(value)

/**
 * Keep what the registry accepts
 * @param {unknown} raw - Untrusted values
 * @return {Partial<ModPreferences>} - Valid values
 */

export const sanitizePreferences = (raw: unknown): Partial<ModPreferences> => {
  if (!raw || typeof raw !== 'object') return {}
  const source = raw as Record<string, unknown>

  return Object.fromEntries(
    Object.entries(MODVIEW_PREFERENCES)
      .filter(([name, rule]) => isValid(rule, source[name]))
      .map(([name]) => [name, source[name]])
  ) as Partial<ModPreferences>
}

/**
 * Stack the layers
 * @param {Partial<ModPreferences>[]} layers - Lowest first
 * @return {ModPreferences} - Applied values
 */

export const applyPreferences = (...layers: Partial<ModPreferences>[]): ModPreferences =>
  Object.assign({}, MODVIEW_DEFAULTS, ...layers) as ModPreferences
