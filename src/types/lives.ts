import type { IconName } from '@/declarations/ui/icons'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * One member seated on a live
 * @typedef {Object} LivePerson
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} avatar - Avatar address
 */

export interface LivePerson {
  id: string
  name: string
  avatar: string | null
}

/**
 * One live as the Livecon page reads it
 * @typedef {Object} LiveView
 */

export interface LiveView {
  id: string
  title: string
  platform: LivePlatformName
  status: LiveStatusName
  youtuber: { id: string; name: string; avatar: string | null }
  plannedStartAt: string
  plannedEndAt: string | null
  startedAt: string | null
  endedAt: string | null
  announcedBy: LivePerson | null
  coordinator: LivePerson | null
  members: LivePerson[]
  liveconLevel: { level: number; name: string; icon: IconName | null; accent: string | null } | null
  // Permissions the viewer holds on this live, coordinator rights folded in
  permissions: PermissionName[]
}

/**
 * Live state the rail and the home read
 * @typedef {Object} LiveBeacon
 * @property {LiveStatusName} status - Most advanced open status
 * @property {{ id: string, creator: string, status: LiveStatusName, plannedStartAt: string }[]} lives - Open lives
 */

export interface LiveBeacon {
  status: LiveStatusName
  lives: { id: string; creator: string; status: LiveStatusName; plannedStartAt: string }[]
}
