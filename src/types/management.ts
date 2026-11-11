import type { MemberAbsence, MemberTag } from '@/types/members'
import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import type { FunctionKindName } from '@/utils/constants/workflow'

/**
 * Member a management row speaks about
 * @typedef {Object} ManagedMember
 * @property {string} id - Account identifier
 * @property {string} displayName - Name shown
 * @property {string | null} avatarUrl - Portrait
 * @property {MemberTag[]} youtubers - Creators the member works for
 */

export interface ManagedMember {
  id: string
  displayName: string
  avatarUrl: string | null
  youtubers: MemberTag[]
}

/**
 * Absences of the perimeter and who they belong to
 * @typedef {Object} ManagedAbsences
 * @property {MemberAbsence[]} absences - Requests, latest first
 * @property {ManagedMember[]} members - Owners of the requests
 */

export interface ManagedAbsences {
  absences: MemberAbsence[]
  members: ManagedMember[]
}

/**
 * Profile a member declared
 * @typedef {Object} ManagedSocial
 * @property {string} id - Link identifier
 * @property {ManagedMember} member - Owner
 * @property {string | null} networkId - Declared network
 * @property {string} label - Network name shown
 * @property {string | null} accent - Colour of the network
 * @property {string} handle - Pseudo
 * @property {string | null} url - Address of the profile
 */

export interface ManagedSocial {
  id: string
  member: ManagedMember
  networkId: string | null
  label: string
  accent: string | null
  handle: string
  url: string | null
}

/**
 * Network a profile can live on
 * @typedef {Object} ManagedNetwork
 * @property {string} id - Network identifier
 * @property {string} label - Name
 * @property {string | null} accent - Colour
 */

export interface ManagedNetwork {
  id: string
  label: string
  accent: string | null
}

/**
 * Networks of the perimeter and the profiles on them
 * @typedef {Object} ManagedSocials
 * @property {ManagedSocial[]} socials - Profiles
 * @property {ManagedNetwork[]} networks - Declared networks, in display order
 */

export interface ManagedSocials {
  socials: ManagedSocial[]
  networks: ManagedNetwork[]
}

/**
 * Private remark and who it concerns
 * @typedef {Object} ManagedNote
 * @property {string} id - Note identifier
 * @property {ManagedMember} member - Whom it concerns
 * @property {string | null} authorId - Writer identifier
 * @property {string | null} authorName - Writer
 * @property {string | null} authorAvatar - Writer portrait
 * @property {string} body - Remark text
 * @property {boolean} pinned - Kept on top
 * @property {string} createdAt - ISO timestamp
 */

export interface ManagedNote {
  id: string
  member: ManagedMember
  authorId: string | null
  authorName: string | null
  authorAvatar: string | null
  body: string
  pinned: boolean
  createdAt: string
}

/**
 * Birthday of a member
 * @typedef {Object} ManagedBirthday
 * @property {string} id - Account identifier
 * @property {ManagedMember} member - Whose birthday
 * @property {string} birthday - ISO date, only month and day matter
 */

export interface ManagedBirthday {
  id: string
  member: ManagedMember
  birthday: string
}

/**
 * Arrival of a member
 * @typedef {Object} ManagedArrival
 * @property {string} id - Account identifier
 * @property {ManagedMember} member - Who arrived
 * @property {string} joinedAt - ISO timestamp
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 */

export interface ManagedArrival {
  id: string
  member: ManagedMember
  joinedAt: string
  role: MemberRoleName
  status: MemberStatusName
}

/**
 * Function held by a member, null when none
 * @typedef {Object} ManagedFunction
 * @property {string} id - Row identifier
 * @property {ManagedMember} member - Who holds it
 * @property {string | null} functionId - Function identifier
 * @property {FunctionKindName | null} kind - Principal or secondary
 */

export interface ManagedFunction {
  id: string
  member: ManagedMember
  functionId: string | null
  kind: FunctionKindName | null
}

/**
 * Functions of the perimeter
 * @typedef {Object} ManagedFunctions
 * @property {ManagedFunction[]} rows - One per member and function
 * @property {{ id: string, label: string }[]} functions - Active functions in display order
 */

export interface ManagedFunctions {
  rows: ManagedFunction[]
  functions: { id: string; label: string }[]
}
