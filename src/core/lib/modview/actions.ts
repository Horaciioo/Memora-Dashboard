import { formatDuration } from '@/core/lib/modview/commands'
import {
  MODVIEW_ACTION_ICONS,
  MODVIEW_ACTION_KINDS,
  MODVIEW_ACTION_LIMITS,
  MODVIEW_ACTION_LOOKS,
} from '@/declarations/modview/actions'
import type { ModActionConfig, ModActionKind, ModViewIntent } from '@/types/modview'
import { normaliseHex } from '@/utils/format/colour'

// Ink painted on a coloured button
const DARK_INK = '#111111'
const LIGHT_INK = '#ffffff'

// Safe key of an action
const ID_PATTERN = /^[\w-]+$/

/**
 * Line an action aims at
 * @typedef {Object} ActionTarget
 * @property {string} chatterId - Viewer
 * @property {string} [messageId] - Line
 */

export interface ActionTarget {
  chatterId: string
  messageId?: string
}

const isKind = (value: unknown): value is ModActionKind =>
  typeof value === 'string' && Object.hasOwn(MODVIEW_ACTION_KINDS, value)

// One untrusted entry
const readAction = (raw: unknown): ModActionConfig | null => {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const { kind, id } = source
  if (!isKind(kind) || typeof id !== 'string') return null
  if (id.length > MODVIEW_ACTION_LIMITS.maxId || !ID_PATTERN.test(id)) return null

  // Only a timeout keeps a length
  const seconds = Number(source.seconds)
  const hasLength =
    Number.isInteger(seconds) && seconds >= 1 && seconds <= MODVIEW_ACTION_LIMITS.maxSeconds
  if (kind === 'timeout' && !hasLength) return null

  const reason =
    typeof source.reason === 'string'
      ? source.reason.trim().slice(0, MODVIEW_ACTION_LIMITS.maxReason)
      : ''
  const icon = typeof source.icon === 'string' ? source.icon : ''
  const look = MODVIEW_ACTION_LOOKS.find((entry) => entry === source.look)

  return {
    id,
    kind,
    seconds: kind === 'timeout' ? seconds : null,
    reason: reason || null,
    icon: Object.hasOwn(MODVIEW_ACTION_ICONS, icon) ? icon : MODVIEW_ACTION_KINDS[kind].icon,
    look: look ?? 'icon',
    colour: typeof source.colour === 'string' ? normaliseHex(source.colour) : null,
    isOn: source.isOn !== false,
  }
}

/**
 * Keep the actions the registry accepts
 * @param {unknown} raw - Untrusted list
 * @return {ModActionConfig[] | null} - Clean list, null when it is not one
 */

export const sanitizeActions = (raw: unknown): ModActionConfig[] | null => {
  if (!Array.isArray(raw)) return null
  const seen = new Set<string>()

  return raw
    .slice(0, MODVIEW_ACTION_LIMITS.maxTotal)
    .map(readAction)
    .filter((entry): entry is ModActionConfig => {
      if (!entry || seen.has(entry.id)) return false
      seen.add(entry.id)

      return true
    })
}

/**
 * Short text of an action
 * @param {ModActionConfig} action - Action
 * @return {string} - Text such as TO 10m
 */

export const actionLabel = (action: ModActionConfig): string => {
  const { short } = MODVIEW_ACTION_KINDS[action.kind]

  return action.kind === 'timeout' && action.seconds
    ? `${short} ${formatDuration(action.seconds)}`
    : short
}

/**
 * Gesture of an action
 * @param {ModActionConfig} action - Action
 * @param {ActionTarget} target - Viewer and line
 * @return {ModViewIntent | null} - Gesture, null when the target lacks a line
 */

export const actionIntent = (
  action: ModActionConfig,
  target: ActionTarget
): ModViewIntent | null => {
  const { chatterId, messageId } = target
  const { reason } = action

  switch (action.kind) {
    case 'timeout':
      return { kind: 'timeout', chatterId, seconds: action.seconds ?? 0, reason }
    case 'purge':
      return {
        kind: 'timeout',
        chatterId,
        seconds: MODVIEW_ACTION_LIMITS.purgeSeconds,
        reason: null,
      }
    case 'ban':
      return { kind: 'ban', chatterId, reason }
    case 'unban':
      return { kind: 'unban', chatterId }
    case 'delete':
      return messageId ? { kind: 'delete', messageId, chatterId } : null
    case 'warn':
      return { kind: 'warn', chatterId, reason: reason ?? '-', ...(messageId ? { messageId } : {}) }
  }
}

/**
 * Whether a warning still needs its reason
 * @param {ModActionConfig} action - Action
 * @return {boolean} - True when none was filled in
 */

export const needsReason = (action: ModActionConfig): boolean =>
  action.kind === 'warn' && !action.reason

/**
 * Whether an action asks before it goes out
 * @param {ModActionConfig} action - Action
 * @return {boolean} - True for a ban or a long timeout
 */

export const isHarsh = (action: ModActionConfig): boolean =>
  MODVIEW_ACTION_KINDS[action.kind].isHarsh ||
  (action.seconds ?? 0) > MODVIEW_ACTION_LIMITS.confirmAboveSeconds

/**
 * Readable ink over a colour
 * @param {string} hex - Background
 * @return {string} - Dark or light ink, whichever contrasts more
 */

export const inkOn = (hex: string): string => {
  const digits = normaliseHex(hex)
  if (!digits) return DARK_INK
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(digits.slice(start, start + 2), 16) / 255

    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue

  // Dark ink wins above the crossover luminance
  return luminance > 0.179 ? DARK_INK : LIGHT_INK
}
