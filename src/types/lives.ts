import type { LiveAccess } from '@/core/lib/lives/access'
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
 * @property {boolean} [isReinforcement] - Called in on the day
 */

export interface LivePerson {
  id: string
  name: string
  avatar: string | null
  isReinforcement?: boolean
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
 * @property {string | null} endsAt - Live end, none when not planned
 * @property {string | null} banner - Creator backdrop
 * @property {string | null} avatar - Creator portrait
 * @property {string | null} askedBy - Responsable who asked
 */

export interface CoordinationRequest {
  liveId: string
  title: string
  creator: string
  startsAt: string
  endsAt: string | null
  banner: string | null
  avatar: string | null
  askedBy: string | null
}

/**
 * One live as the Livecon page reads it
 * @typedef {Object} LiveView
 */

export interface LiveView {
  id: string
  // Open to enter, too early, or over
  access: LiveAccess
  // ISO moment the doors open, before the planned start
  opensAt: string
  // Closed before its planned end, a Responsable or Coordinator may put it back
  canReopen: boolean
  title: string
  platform: LivePlatformName
  status: LiveStatusName
  youtuber: { id: string; name: string; avatar: string | null; banner?: string | null }
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
  // Viewer's own answer to the roll-call, none when not convened
  myAttendance: AttendanceStatusName | null
  // Hours the viewer gave with their Present, none when not given
  myHours: { from: string; to: string } | null
  // Responsables and Admins convened on it
  responsables: LivePerson[]
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
    platform: LivePlatformName
    status: LiveStatusName
    plannedStartAt: string
    // Called in as reinforcement
    isReinforcement: boolean
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
 * Time one member moderated a live against the hours they gave
 * @typedef {Object} LiveSpan
 * @property {number} seconds - Time moderated
 * @property {string} from - ISO first start, the hours given when never there
 * @property {string} to - ISO last end, the hours given when never there
 * @property {{ from: string, to: string } | null} declared - Hours given on the roll-call
 * @property {boolean} isAbsent - Gave hours and was never there during them
 * @property {number} extraSeconds - Time moderated outside the hours given
 */

export interface LiveSpan {
  seconds: number
  from: string
  to: string
  declared: { from: string; to: string } | null
  isAbsent: boolean
  extraSeconds: number
}

/**
 * Time one member moderated a live
 * @typedef {Object} LiveModTime
 * @property {string} accountId - Member
 * @property {string} name - Display name
 * @property {string | null} avatar - Avatar address
 * @property {string | null} outside - Where they come from when not the Live team
 * @property {{ requestedBy: string | null } | null} reinforcement - Called in on the day, and by whom
 */

export interface LiveModTime extends LiveSpan {
  accountId: string
  name: string
  avatar: string | null
  outside: string | null
  reinforcement: { requestedBy: string | null } | null
}

/**
 * One live a member moderated
 * @typedef {Object} MemberLiveSummary
 * @property {string | null} creatorAvatar - Creator's avatar address
 * @property {string} title - Title of the live
 * @property {LiveSpan | null} span - Time they moderated it
 * @property {boolean} isReinforcement - They were called in on the day
 */

export interface MemberLiveSummary {
  liveId: string
  creator: string
  creatorAvatar: string | null
  title: string
  platform: LivePlatformName
  startedAt: string
  activeSeconds: number
  visibleSeconds: number
  span: LiveSpan | null
  isReinforcement: boolean
  kinds: { kind: ModerationKind; count: number }[]
  lines: LiveLogLine[]
}

/**
 * Moderation side of a member's file
 * @typedef {Object} MemberModerationView
 * @property {number} windowSeconds - Time spent in the Mod View over the window
 * @property {number} windowActiveSeconds - Time actually acting over the window
 * @property {number} windowLives - Lives joined over the window
 * @property {MemberLiveSummary[]} lives - Latest lives
 */

export interface MemberModerationView {
  windowSeconds: number
  windowActiveSeconds: number
  windowLives: number
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
 * @property {string | null} plannedFrom - ISO hour they said they would be there, for Responsables
 * @property {boolean} isReinforcement - Called in on the day
 */

export interface LiveRosterPerson {
  id: string
  name: string
  avatar: string | null
  status: AttendanceStatusName
  isJunior: boolean
  plannedFrom: string | null
  isReinforcement: boolean
}

/**
 * Roll-call of one live
 * @typedef {Object} LiveRoster
 * @property {string} liveId - Live identifier
 * @property {boolean} canManage - Viewer may move people
 * @property {string[]} connectedIds - Members with a Mod View open
 * @property {LiveRosterPerson[]} people - Convened members
 */

export interface LiveRoster {
  liveId: string
  canManage: boolean
  connectedIds: string[]
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
 * @property {string | null} actorName - Who did it, hidden from a Modo for a colleague
 * @property {string} liveTitle - Live it happened on
 * @property {boolean} fromPanel - Applied from the panel
 * @property {string | null} offenseId - Panel offence applied
 * @property {number | null} rung - Panel rung applied
 * @property {string} occurredAt - ISO moment
 */

export interface ViewerSanction {
  id: string
  kind: ModerationKind
  durationSeconds: number | null
  reason: string | null
  actorName: string | null
  liveTitle: string
  fromPanel: boolean
  offenseId: string | null
  rung: number | null
  occurredAt: string
}

/**
 * Private comment a member left on a viewer
 * @typedef {Object} ViewerComment
 * @property {string} id - Comment identifier
 * @property {string} body - Text
 * @property {string | null} authorName - Member who wrote it
 * @property {string} createdAt - ISO moment
 */

export interface ViewerComment {
  id: string
  body: string
  authorName: string | null
  createdAt: string
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

/**
 * Note a member left on a viewer during a live
 * @typedef {Object} LiveNote
 * @property {string} id - Note identifier
 * @property {string | null} authorId - Member who wrote it
 * @property {string} authorName - Display name
 * @property {string} viewerLogin - Viewer the note is about
 * @property {string} body - Note text
 * @property {string} at - ISO moment
 */

export interface LiveNote {
  id: string
  authorId: string | null
  authorName: string
  viewerLogin: string
  body: string
  at: string
}
