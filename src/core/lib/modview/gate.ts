import { CHAT_MODES, MODVIEW_WINDOWS, PERMISSION_OWNERS } from '@/declarations/modview/registries'
import { MODVIEW_LOCK_COPY } from '@/declarations/modview/copy'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type { ModViewIntent, ModViewWindow } from '@/types/modview'

// Livecon level at which only the admin talks
const CRISIS_LEVEL = 1

/**
 * Whether a gesture may be played
 * @typedef {Object} IntentGate
 * @property {boolean} allowed - Clickable
 * @property {string | null} reason - Said on the greyed control
 */

export interface IntentGate {
  allowed: boolean
  reason: string | null
}

const OPEN: IntentGate = { allowed: true, reason: null }

/**
 * Lock a control behind one permission
 * @param {PermissionName} permission - Needed
 * @param {string} [owners] - Who holds it
 * @return {IntentGate} - Locked gate
 */

const locked = (permission: PermissionName, owners?: string): IntentGate => ({
  allowed: false,
  reason: MODVIEW_LOCK_COPY.role.replace(
    '{who}',
    owners ?? PERMISSION_OWNERS[permission] ?? permission
  ),
})

/**
 * Permission one gesture needs
 * @param {ModViewIntent} intent - Gesture
 * @return {{ permission: PermissionName, owners?: string }} - Requirement
 */

const requirementOf = (intent: ModViewIntent): { permission: PermissionName; owners?: string } => {
  switch (intent.kind) {
    case 'unbanRequest':
      return { permission: Permissions.LiveUnbanRequest }
    case 'mode':
      return {
        permission: CHAT_MODES.get(intent.mode).permission,
        owners: CHAT_MODES.get(intent.mode).owners,
      }
    case 'term':
      return { permission: Permissions.LiveTerms }
    default:
      return { permission: Permissions.LiveModerate }
  }
}

/**
 * Gestures a platform does not expose
 * @param {ModViewIntent} intent - Gesture
 * @param {LivePlatformName} platform - Live platform
 * @return {boolean} - Exposed
 */

const exposedOn = (intent: ModViewIntent, platform: LivePlatformName): boolean => {
  if (platform === LivePlatforms.Twitch) return true

  // YouTube has no automod queue
  return !['automod', 'term', 'mode', 'unbanRequest', 'warn'].includes(intent.kind)
}

/**
 * Decide whether a gesture is open to the viewer
 * @param {ModViewIntent} intent - Gesture
 * @param {Object} context - Live context
 * @param {PermissionName[]} context.permissions - Held on this live
 * @param {LivePlatformName} context.platform - Live platform
 * @param {number | null} context.liveconLevel - Level in force
 * @param {boolean} [context.offline] - Platform not reached
 * @param {string | null} [context.offlineReason] - Why
 * @return {IntentGate} - Gate
 */

export const gateIntent = (
  intent: ModViewIntent,
  context: {
    permissions: PermissionName[]
    platform: LivePlatformName
    liveconLevel: number | null
    offline?: boolean
    offlineReason?: string | null
  }
): IntentGate => {
  if (context.offline) {
    return { allowed: false, reason: context.offlineReason ?? MODVIEW_LOCK_COPY.offline }
  }

  if (!exposedOn(intent, context.platform)) {
    return { allowed: false, reason: MODVIEW_LOCK_COPY.platform }
  }

  // Livecon 1 silences public talk for everyone but the admin
  if (
    intent.kind === 'say' &&
    context.liveconLevel === CRISIS_LEVEL &&
    !context.permissions.includes(Permissions.LiveCrisisChat)
  ) {
    return { allowed: false, reason: MODVIEW_LOCK_COPY.crisis }
  }

  const { permission, owners } = requirementOf(intent)
  if (!context.permissions.includes(permission)) return locked(permission, owners)

  return OPEN
}

/**
 * Windows a platform shows
 * @param {LivePlatformName} platform - Live platform
 * @return {ModViewWindow[]} - Visible windows
 */

export const windowsOf = (platform: LivePlatformName): ModViewWindow[] =>
  MODVIEW_WINDOWS.keys.filter((key) => MODVIEW_WINDOWS.get(key).platforms.includes(platform))
