import type { FormValues } from '@/types/forms'
import type {
  DepartureKindName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import type { AbsenceStatusName, FunctionKindName } from '@/utils/constants/workflow'

/**
 * Reference pointed at by a member
 * @typedef {Object} MemberTag
 * @property {string} id - Row identifier
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 */

export interface MemberTag {
  id: string
  label: string
  accent: string | null
  // Creator portrait
  image?: string | null
}

/**
 * Function held by a member
 * @typedef {Object} MemberFunction
 * @property {string} id - Function identifier
 * @property {string} label - Function name
 * @property {FunctionKindName} kind - Principal or secondary
 * @property {string | null} icon - Glyph key
 * @property {number} position - Rank among the functions
 */

export interface MemberFunction {
  id: string
  label: string
  kind: FunctionKindName
  icon: string | null
  position: number
}

/**
 * Division shown on a member card
 * @typedef {Object} MemberDivision
 * @property {string} id - Division identifier
 * @property {string} label - Division name
 */

export interface MemberDivision {
  id: string
  label: string
}

/**
 * Row of the moderator list
 * @typedef {Object} MemberSummary
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string} discordId - Discord identifier
 * @property {string | null} avatarUrl - Portrait
 * @property {string | null} bannerUrl - Discord profile banner
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 * @property {MemberTag | null} academyDispositif - Dispositif of the active FSI
 * @property {string | null} academyJuniorId - Junior identifier of the active FSI
 * @property {string | null} academySessionId - Session identifier of the active FSI
 * @property {MemberDivision | null} division - Division
 * @property {MemberTag[]} youtubers - Assigned YouTubers
 * @property {MemberFunction[]} functions - Functions held
 * @property {string} joinedAt - ISO arrival date
 * @property {boolean} isRoot - Root administrator
 * @property {number} notesCount - Private remarks left on the account
 * @property {boolean} isAbsent - Covered by an approved absence today
 */

export interface MemberSummary {
  id: string
  displayName: string
  discordId: string
  avatarUrl: string | null
  bannerUrl: string | null
  role: MemberRoleName
  status: MemberStatusName
  academyDispositif: MemberTag | null
  academyJuniorId: string | null
  academySessionId: string | null
  division: MemberDivision | null
  youtubers: MemberTag[]
  functions: MemberFunction[]
  joinedAt: string
  isRoot: boolean
  notesCount: number
  isAbsent: boolean
}

/**
 * Private remark left on a member
 * @typedef {Object} MemberNote
 * @property {string} id - Note identifier
 * @property {string} body - Remark text
 * @property {boolean} pinned - Kept on top
 * @property {boolean} system - Written by Memora itself
 * @property {string | null} authorName - Who wrote it
 * @property {string} createdAt - ISO timestamp
 */

export interface MemberNote {
  id: string
  body: string
  pinned: boolean
  system: boolean
  authorName: string | null
  createdAt: string
}

/**
 * Social profile of a member
 * @typedef {Object} MemberSocial
 * @property {string} id - Link identifier
 * @property {string | null} networkId - Declared network
 * @property {string} label - Network name
 * @property {string} handle - Profile handle
 * @property {string | null} url - Profile URL
 * @property {string | null} accent - Colour token
 */

export interface MemberSocial {
  id: string
  networkId: string | null
  label: string
  handle: string
  url: string | null
  accent: string | null
}

/**
 * Time off declared by a member
 * @typedef {Object} MemberAbsence
 * @property {string} id - Absence identifier
 * @property {string} accountId - Member identifier
 * @property {string} memberName - Member display name
 * @property {string} startDate - ISO first day
 * @property {string} endDate - ISO last day
 * @property {number} dayCount - Day count
 * @property {string | null} reason - Motive
 * @property {AbsenceStatusName} status - Review outcome
 * @property {string | null} reviewNote - Review remark
 */

export interface MemberAbsence {
  id: string
  accountId: string
  memberName: string
  startDate: string
  endDate: string
  dayCount: number
  reason: string | null
  status: AbsenceStatusName
  reviewNote: string | null
}

/**
 * Full moderator file
 * @typedef {Object} MemberDetail
 * @property {MemberSummary} summary - List level fields
 * @property {FormValues} values - Values feeding the edit form
 * @property {string | null} birthday - ISO birthday
 * @property {boolean} celebrateBirthday - Wants it celebrated
 * @property {string[]} languages - Spoken languages
 * @property {string | null} leftAt - ISO departure date
 * @property {boolean} erased - Personal data erased for good
 * @property {MemberNote[]} notes - Private remarks
 * @property {MemberSocial[]} socials - Social profiles
 * @property {MemberAbsence[]} absences - Time off
 * @property {string[]} teams - Team names
 * @property {number} projectCount - Projects taken part in
 * @property {number} taskCount - Tasks owned
 * @property {number} meetingCount - Meetings attended
 */

export interface MemberDetail {
  summary: MemberSummary
  values: FormValues
  birthday: string | null
  celebrateBirthday: boolean
  languages: string[]
  leftAt: string | null
  erased: boolean
  notes: MemberNote[]
  socials: MemberSocial[]
  absences: MemberAbsence[]
  teams: string[]
  projectCount: number
  taskCount: number
  meetingCount: number
}

/**
 * Pause on a member's live moderation
 * @typedef {Object} MemberSuspension
 * @property {string} id - Row identifier
 * @property {string} endsAt - Last moment, ISO
 * @property {string | null} reason - Why
 */

export interface MemberSuspension {
  id: string
  endsAt: string
  reason: string | null
}

/**
 * Departure announcement of a member
 * @typedef {Object} MemberDeparture
 * @property {string} id - Notice identifier
 * @property {DepartureKindName} kind - Dismissal or resignation
 * @property {string} body - Discord markdown, ready to paste
 */

export interface MemberDeparture {
  id: string
  kind: DepartureKindName
  body: string
}

/**
 * What the Admin tab acts on
 * @typedef {Object} MemberAdminState
 * @property {string | null} frozenAt - Freeze moment, ISO
 * @property {MemberSuspension | null} suspension - Live pause in force
 * @property {MemberDeparture | null} departure - Last announcement
 * @property {boolean} isGone - Member already left
 */

export interface MemberAdminState {
  frozenAt: string | null
  suspension: MemberSuspension | null
  departure: MemberDeparture | null
  isGone: boolean
}
