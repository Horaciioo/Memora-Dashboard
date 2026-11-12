import features from '@/configurations/system/features.json'

/**
 * Feature keys switched off in the file
 * @type {ReadonlySet<string>}
 */

export const DISABLED_FEATURES: ReadonlySet<string> = new Set(
  Object.entries(features as Record<string, unknown>)
    .filter(([key, value]) => {
      if (typeof value === 'boolean') return !value
      console.warn(
        `[config] system/features.${key} is not a boolean (got ${JSON.stringify(value)}), kept on`
      )
      return false
    })
    .map(([key]) => key)
)
