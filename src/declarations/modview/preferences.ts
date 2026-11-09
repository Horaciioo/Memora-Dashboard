import { MODVIEW_DEFAULT_ACTIONS } from '@/declarations/modview/actions'
import type { ModActionConfig, ModPreferences } from '@/types/modview'

/**
 * One preference rule
 * @typedef {{ kind: 'toggle', default: boolean } | { kind: 'choice', options: readonly string[], default: string } | { kind: 'actions', default: readonly ModActionConfig[] }} PreferenceDefinition
 */

export type PreferenceDefinition =
  | { kind: 'toggle'; default: boolean }
  | { kind: 'choice'; options: readonly string[]; default: string }
  | { kind: 'actions'; default: readonly ModActionConfig[] }

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
  toolsPosition: { kind: 'choice', options: ['left', 'hover', 'right', 'card'], default: 'left' },
  keepResolved: { kind: 'toggle', default: false },
  actions: { kind: 'actions', default: MODVIEW_DEFAULT_ACTIONS },
  confirmHarsh: { kind: 'toggle', default: true },
  hideBots: { kind: 'toggle', default: false },
  textSize: { kind: 'choice', options: ['small', 'normal', 'large'], default: 'normal' },
  density: { kind: 'choice', options: ['compact', 'normal', 'airy'], default: 'normal' },
} as const satisfies Record<keyof ModPreferences, PreferenceDefinition>
