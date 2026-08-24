import type { FormValues } from '@/types/forms'
import type {
  AcademyPeriodName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import type { AbsenceStatusName } from '@/utils/constants/workflow'

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
}

/**
 * Division shown on a member card
 * @typedef {Object} MemberDivision
 * @property {string} id - Division identifier
 * @property {string} label - Division name
 * @property {string | null} glyph - Chevrons
 * @property {string | null} imagePath - Visual
 * @property {number} rank - Division rank
 */

export interface MemberDivision {
  id: string
  label: string
  glyph: string | null
  imagePath: string | null
  rank: number
}

/**
 * Row of the moderator list
 * @typedef {Object} MemberSummary
 * @property {string} id - Account identifier
 * @property {string} displayName - Display name
 * @property {string} discordId - Discord identifier
 * @property {string | null} avatarUrl - Portrait
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 * @property {MemberTag | null} academyDispositif - Dispositif of the active FSI
 * @property {MemberDivision | null} division - Division
 * @property {MemberTag[]} youtubers - Assigned YouTubers
 * @property {MemberTag | null} primaryFunction - Main function
 * @property {MemberTag | null} secondaryFunction - Secondary function
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
  role: MemberRoleName
  status: MemberStatusName
  academyDispositif: MemberTag | null
  division: MemberDivision | null
  youtubers: MemberTag[]
  primaryFunction: MemberTag | null
  secondaryFunction: MemberTag | null
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
 * @property {string | null} authorName - Who wrote it
 * @property {string} createdAt - ISO timestamp
 */

export interface MemberNote {
  id: string
  body: string
  pinned: boolean
  authorName: string | null
  createdAt: string
}

/**
 * Social profile of a member, declared by the member themselves
 * @typedef {Object} MemberSocial
 * @property {string} id - Link identifier
 * @property {string} label - Network name
 * @property {string} handle - Profile handle
 * @property {string | null} url - Profile URL
 * @property {string | null} accent - Colour token
 */

export interface MemberSocial {
  id: string
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
 * @property {string | null} reviewerName - Who reviewed it
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
  reviewerName: string | null
  reviewNote: string | null
}

/**
 * Training progression of a member
 * @typedef {Object} MemberTraining
 * @property {string} id - Training identifier
 * @property {string} name - Training name
 * @property {AcademyPeriodName | null} period - Academy period
 * @property {boolean} mandatory - Required to progress
 * @property {string | null} completedAt - ISO completion date
 * @property {string | null} validatorName - Who validated it
 */

export interface MemberTraining {
  id: string
  name: string
  period: AcademyPeriodName | null
  mandatory: boolean
  completedAt: string | null
  validatorName: string | null
}

/**
 * Full moderator file
 * @typedef {Object} MemberDetail
 * @property {MemberSummary} summary - List level fields
 * @property {FormValues} values - Values feeding the edit form
 * @property {string | null} email - Mail address
 * @property {string | null} phone - Phone number
 * @property {string | null} birthday - ISO birthday
 * @property {boolean} celebrateBirthday - Wants it celebrated
 * @property {string[]} languages - Spoken languages
 * @property {string | null} leftAt - ISO departure date
 * @property {MemberNote[]} notes - Private remarks
 * @property {MemberSocial[]} socials - Social profiles
 * @property {MemberAbsence[]} absences - Time off
 * @property {MemberTraining[]} trainings - Academy progression
 * @property {string[]} teams - Team names
 * @property {number} projectCount - Projects taken part in
 * @property {number} taskCount - Tasks owned
 * @property {number} meetingCount - Meetings attended
 */

export interface MemberDetail {
  summary: MemberSummary
  values: FormValues
  email: string | null
  phone: string | null
  birthday: string | null
  celebrateBirthday: boolean
  languages: string[]
  leftAt: string | null
  notes: MemberNote[]
  socials: MemberSocial[]
  absences: MemberAbsence[]
  trainings: MemberTraining[]
  teams: string[]
  projectCount: number
  taskCount: number
  meetingCount: number
}
