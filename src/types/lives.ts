import type { ModerationKind, ModerationOrigin, ModerationStatus } from '@prisma/client'
import type { IconName } from '@/declarations/ui/icons'
import type { LivePlatformName, LiveStatusName } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

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

/**
 * One log line as the report page shows it
 * @typedef {Object} LiveLogLine
 */

export interface LiveLogLine {
  id: string
  kind: ModerationKind
  actorKey: string
  actorName: string
  isMember: boolean
  targetLogin: string | null
  durationSeconds: number | null
  reason: string | null
  excerpt: string | null
  origin: ModerationOrigin
  status: ModerationStatus
  liveconLevel: number | null
  occurredAt: string
}

/**
 * One live a member moderated, as their file shows it
 * @typedef {Object} MemberLiveSummary
 */

export interface MemberLiveSummary {
  liveId: string
  creator: string
  platform: LivePlatformName
  startedAt: string
  activeSeconds: number
  visibleSeconds: number
  kinds: { kind: ModerationKind; count: number }[]
  lines: LiveLogLine[]
}

/**
 * Moderation side of a member's file
 * @typedef {Object} MemberModerationView
 * @property {number} windowSeconds - Time spent in the Mod View over the window
 * @property {MemberLiveSummary[]} lives - Latest lives, newest first
 */

export interface MemberModerationView {
  windowSeconds: number
  lives: MemberLiveSummary[]
}

/**
 * One member on a live's roll-call
 * @typedef {Object} LiveRosterPerson
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} avatar - Avatar address
 * @property {AttendanceStatusName} status - Answer in force
 * @property {boolean} isJunior - Counted for a PIM
 */

export interface LiveRosterPerson {
  id: string
  name: string
  avatar: string | null
  status: AttendanceStatusName
  isJunior: boolean
}

/**
 * Roll-call of one live
 * @typedef {Object} LiveRoster
 * @property {string} liveId - Live identifier
 * @property {boolean} canManage - Viewer may move people
 * @property {LiveRosterPerson[]} people - Convened members
 */

export interface LiveRoster {
  liveId: string
  canManage: boolean
  people: LiveRosterPerson[]
}
