import { sanitizeActions } from '@/core/lib/modview/actions'
import { sanitizeBadwords, sanitizeWords } from '@/core/lib/modview/personal'
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

// Value the rule accepts, cleaned, undefined when refused
const readValue = (rule: PreferenceDefinition, value: unknown): unknown => {
  if (rule.kind === 'toggle') return typeof value === 'boolean' ? value : undefined
  if (rule.kind === 'actions') return sanitizeActions(value) ?? undefined
  if (rule.kind === 'words') return sanitizeWords(value, rule.max) ?? undefined
  if (rule.kind === 'badwords') return sanitizeBadwords(value, rule.max) ?? undefined

  return typeof value === 'string' && rule.options.includes(value) ? value : undefined
}

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
      .map(([name, rule]) => [name, readValue(rule, source[name])] as const)
      .filter(([, value]) => value !== undefined)
  ) as Partial<ModPreferences>
}

/**
 * Stack the layers
 * @param {Partial<ModPreferences>[]} layers - Lowest first
 * @return {ModPreferences} - Applied values
 */

export const applyPreferences = (...layers: Partial<ModPreferences>[]): ModPreferences =>
  Object.assign({}, MODVIEW_DEFAULTS, ...layers) as ModPreferences
