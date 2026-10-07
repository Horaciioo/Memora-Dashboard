import type { ModerationKind, ModerationOrigin, ModerationStatus } from '@prisma/client'
import type { IconName } from '@/declarations/ui/icons'
import type {
  CoordinationStatusName,
  LivePlatformName,
  LiveStatusName,
} from '@/utils/constants/lives'
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
 * One member asked to coordinate a live
 * @typedef {Object} LiveCoordinatorSeat
 * @property {LivePerson} person - Member asked
 * @property {CoordinationStatusName} status - Answer
 * @property {string | null} startsAt - Agreed window start
 * @property {string | null} endsAt - Agreed window end
 */

export interface LiveCoordinatorSeat {
  person: LivePerson
  status: CoordinationStatusName
  startsAt: string | null
  endsAt: string | null
}

/**
 * Stretch of a live nobody coordinates
 * @typedef {Object} LiveGap
 * @property {string} from - Gap start
 * @property {string} to - Gap end
 */

export interface LiveGap {
  from: string
  to: string
}

/**
 * Request waiting on the member's answer
 * @typedef {Object} CoordinationRequest
 * @property {string} liveId - Live
 * @property {string} title - Live title
 * @property {string} creator - Creator name
 * @property {string} startsAt - Live start
 * @property {string} endsAt - Live end
 * @property {string | null} askedBy - Responsable who asked
 */

export interface CoordinationRequest {
  liveId: string
  title: string
  creator: string
  startsAt: string
  endsAt: string
  askedBy: string | null
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
  coordinators: LiveCoordinatorSeat[]
  // Stretches nobody agreed to coordinate
  gaps: LiveGap[]
  // Viewer holds the coordinator rights right now
  isCoordinating: boolean
  // Instructions of the responsables
  instructions: string
  members: LivePerson[]
  liveconLevel: { level: number; name: string; icon: IconName | null; accent: string | null } | null
  // Permissions the viewer holds on this live
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
  lives: {
    id: string
    creator: string
    creatorAvatar: string | null
    status: LiveStatusName
    plannedStartAt: string
  }[]
  // Live on air the viewer was not told about yet
  unseenStart: { id: string; creator: string } | null
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
 * One live a member moderated
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
 * @property {MemberLiveSummary[]} lives - Latest lives
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

/**
 * One Focus open on a live
 * @typedef {Object} LiveFocusView
 * @property {string} id - Focus identifier
 * @property {string} watcherId - Follower
 * @property {string} watcherName - Follower name
 * @property {string} targetId - Member followed
 * @property {string} targetName - Their name
 * @property {string | null} targetLogin - Their platform login
 * @property {string} startedAt - ISO start
 */

export interface LiveFocusView {
  id: string
  watcherId: string
  watcherName: string
  targetId: string
  targetName: string
  targetLogin: string | null
  startedAt: string
}

/**
 * One past sanction of a viewer
 * @typedef {Object} ViewerSanction
 * @property {string} id - Log line
 * @property {ModerationKind} kind - Gesture
 * @property {number | null} durationSeconds - Timeout length
 * @property {string | null} reason - Reason
 * @property {string} actorName - Who did it
 * @property {string} liveTitle - Live it happened on
 * @property {boolean} fromPanel - Applied from the panel
 * @property {string} occurredAt - ISO moment
 */

export interface ViewerSanction {
  id: string
  kind: ModerationKind
  durationSeconds: number | null
  reason: string | null
  actorName: string
  liveTitle: string
  fromPanel: boolean
  occurredAt: string
}

/**
 * Activity of one moderator on a live
 * @typedef {Object} ModeratorInspect
 * @property {string} accountId - Moderator
 * @property {string} name - Display name
 * @property {string | null} avatar - Avatar address
 * @property {AttendanceStatusName | null} attendance - Roll-call answer
 * @property {boolean} isAbsent - On approved leave now
 * @property {number} activeSeconds - Time active in the Mod View
 * @property {{ id: string, kind: ModerationKind, targetLogin: string | null, durationSeconds: number | null, reason: string | null, fromPanel: boolean, onBehalfOf: string | null, occurredAt: string }[]} gestures - Latest gestures
 */

export interface ModeratorInspect {
  accountId: string
  name: string
  avatar: string | null
  attendance: AttendanceStatusName | null
  isAbsent: boolean
  activeSeconds: number
  gestures: {
    id: string
    kind: ModerationKind
    targetLogin: string | null
    durationSeconds: number | null
    reason: string | null
    fromPanel: boolean
    onBehalfOf: string | null
    occurredAt: string
  }[]
}
