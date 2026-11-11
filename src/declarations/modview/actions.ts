import { TWITCH_LIMITS } from '@/declarations/platforms/twitch'
import type { IconName } from '@/declarations/ui/icons'
import type { ModActionConfig, ModActionKind } from '@/types/modview'

/**
 * One kind of action
 * @typedef {Object} ModActionKindOption
 * @property {string} label - Name in the editor
 * @property {string} short - Name on a button
 * @property {string} icon - Default glyph key
 * @property {string} tone - Default colour variable
 * @property {boolean} needsLength - Carries a timeout length
 * @property {boolean} isHarsh - Asks before it goes out
 * @property {boolean} needsMessage - Aims at a line
 */

export interface ModActionKindOption {
  label: string
  short: string
  icon: string
  tone: string
  needsLength: boolean
  isHarsh: boolean
  needsMessage: boolean
}

export const MODVIEW_ACTION_KINDS: Record<ModActionKind, ModActionKindOption> = {
  timeout: {
    label: 'Exclusion temporaire',
    short: 'TO',
    icon: 'actTimer',
    tone: 'var(--color-caution)',
    needsLength: true,
    isHarsh: false,
    needsMessage: false,
  },
  ban: {
    label: 'Bannissement',
    short: 'Ban',
    icon: 'actBan',
    tone: 'var(--color-danger)',
    needsLength: false,
    isHarsh: true,
    needsMessage: false,
  },
  unban: {
    label: 'Débannissement',
    short: 'Unban',
    icon: 'actUnban',
    tone: 'var(--color-success)',
    needsLength: false,
    isHarsh: false,
    needsMessage: false,
  },
  delete: {
    label: 'Suppression du message',
    short: 'Suppr.',
    icon: 'actTrash',
    tone: 'var(--color-danger)',
    needsLength: false,
    isHarsh: false,
    needsMessage: true,
  },
  warn: {
    label: 'Avertissement',
    short: 'Avertir',
    icon: 'actWarn',
    tone: 'var(--color-warning)',
    needsLength: false,
    isHarsh: false,
    needsMessage: false,
  },
  purge: {
    label: 'Purge des messages',
    short: 'Purge',
    icon: 'actBroom',
    tone: 'var(--color-caution)',
    needsLength: false,
    isHarsh: false,
    needsMessage: false,
  },
}

export const MODVIEW_ACTION_KIND_NAMES = Object.keys(MODVIEW_ACTION_KINDS) as ModActionKind[]

/**
 * Glyphs a moderator can pick
 * @type {Record<string, { label: string }>}
 */

export const MODVIEW_ACTION_ICONS = {
  actTrash: { label: 'Corbeille' },
  actTimer: { label: 'Minuteur' },
  actClock: { label: 'Horloge' },
  actBan: { label: 'Interdit' },
  actUnban: { label: 'Débannir' },
  actWarn: { label: 'Avertir' },
  actHammer: { label: 'Marteau' },
  actGavel: { label: 'Maillet' },
  actBolt: { label: 'Éclair' },
  actSkull: { label: 'Crâne' },
  actBrokenHeart: { label: 'Cœur brisé' },
  actBroom: { label: 'Balai' },
  actEye: { label: 'Œil' },
  actShield: { label: 'Bouclier' },
  actSiren: { label: 'Sirène' },
} as const satisfies Partial<Record<IconName, { label: string }>>

export type ModActionIconName = keyof typeof MODVIEW_ACTION_ICONS

export const MODVIEW_ACTION_ICON_NAMES = Object.keys(MODVIEW_ACTION_ICONS) as ModActionIconName[]

export const MODVIEW_ACTION_LOOKS = ['icon', 'label', 'both'] as const

/**
 * Bounds of the list
 * @type {Record<string, number>}
 */

export const MODVIEW_ACTION_LIMITS = {
  // Buttons shown before the overflow menu
  maxInline: 7,
  maxTotal: 14,
  maxSeconds: TWITCH_LIMITS.maxTimeoutSeconds,
  maxReason: TWITCH_LIMITS.maxReasonLength,
  maxId: 40,
  // Longest timeout that goes out without asking
  confirmAboveSeconds: 86_400,
  // Length of the purge timeout
  purgeSeconds: 1,
  // Length of a new timeout
  newSeconds: 600,
}

const action = (
  id: string,
  kind: ModActionKind,
  seconds: number | null,
  icon: ModActionIconName
): ModActionConfig => ({
  id,
  kind,
  seconds,
  reason: null,
  icon,
  look: 'icon',
  colour: null,
  isOn: true,
})

/**
 * Buttons every moderator starts with
 * @type {readonly ModActionConfig[]}
 */

export const MODVIEW_DEFAULT_ACTIONS: readonly ModActionConfig[] = [
  action('delete', 'delete', null, 'actTrash'),
  action('timeout-10m', 'timeout', 600, 'actTimer'),
  action('timeout-1h', 'timeout', 3600, 'actClock'),
  action('timeout-1d', 'timeout', 86_400, 'actHammer'),
  action('ban', 'ban', null, 'actBan'),
]

/**
 * Base measures of a viewer file, fixed
 * @type {readonly ModActionConfig[]}
 */

export const MODVIEW_BASE_MEASURES: readonly ModActionConfig[] = [
  action('base-warn', 'warn', null, 'actWarn'),
  action('base-ban', 'ban', null, 'actBan'),
  action('base-unban', 'unban', null, 'actUnban'),
]
