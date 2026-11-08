import type { ModPreferences } from '@/types/modview'

/**
 * One preference rule
 * @typedef {{ kind: 'toggle', default: boolean } | { kind: 'choice', options: readonly string[], default: string }} PreferenceDefinition
 */

export type PreferenceDefinition =
  | { kind: 'toggle'; default: boolean }
  | { kind: 'choice'; options: readonly string[]; default: string }

/**
 * Every Mod View preference
 * @type {Record<keyof ModPreferences, PreferenceDefinition>}
 */

export const MODVIEW_PREFERENCES = {
  timestamps: { kind: 'toggle', default: false },
  badges: { kind: 'toggle', default: true },
  deleted: { kind: 'toggle', default: true },
  firstMessages: { kind: 'toggle', default: true },
  colouredNames: { kind: 'toggle', default: true },
  pauseMode: { kind: 'choice', options: ['hover', 'alt'], default: 'hover' },
  toolsPosition: { kind: 'choice', options: ['left', 'hover'], default: 'left' },
  keepResolved: { kind: 'toggle', default: false },
} as const satisfies Record<keyof ModPreferences, PreferenceDefinition>
