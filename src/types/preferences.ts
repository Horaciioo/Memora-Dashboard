import type { MemberRoleName, MemberStatusName } from '@/utils/constants/hierarchy'
import type { FormValues } from '@/types/forms'

/**
 * What a member may read and change about themselves
 * @typedef {Object} ProfileDetail
 * @property {string} displayName - Display name, owned by the responsables
 * @property {string} discordId - Identifier used to sign in
 * @property {MemberRoleName} role - Hierarchy level
 * @property {MemberStatusName} status - Membership status
 * @property {string | null} academyDispositif - Dispositif of the active FSI
 * @property {string | null} division - Division name
 * @property {string[]} youtubers - Assigned creators
 * @property {string | null} primaryFunction - Main function
 * @property {string | null} secondaryFunction - Secondary function
 * @property {string} joinedAt - Day the member arrived
 * @property {FormValues} values - Values feeding the editable form
 */

export interface ProfileDetail {
  displayName: string
  discordId: string
  role: MemberRoleName
  status: MemberStatusName
  academyDispositif: string | null
  division: string | null
  youtubers: string[]
  primaryFunction: string | null
  secondaryFunction: string | null
  joinedAt: string
  values: FormValues
}

/**
 * One open session of the signed-in member
 * @typedef {Object} AccountSession
 * @property {string} id - Session identifier
 * @property {string | null} userAgent - Client that opened it
 * @property {string} createdAt - Opening moment
 * @property {string} lastUsedAt - Last use
 * @property {string} expiresAt - Expiry moment
 * @property {boolean} isCurrent - Session answering this page
 */

export interface AccountSession {
  id: string
  userAgent: string | null
  createdAt: string
  lastUsedAt: string
  expiresAt: string
  isCurrent: boolean
}
