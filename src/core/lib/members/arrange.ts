import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { MemberFunction, MemberSummary } from '@/types/members'

/**
 * Members laid out inside one creator box
 * @typedef {Object} ArrangedMembers
 * @property {MemberSummary[]} administration - Admins, then responsables
 * @property {MemberSummary[]} moderators - Everyone else, grouped by function
 */

export interface ArrangedMembers {
  administration: MemberSummary[]
  moderators: MemberSummary[]
}

// Roles drawn from the list, their access stays whole
export const UNLISTED_ROLES: MemberRoleName[] = [MemberRoles.Employe]

// Roles sitting in the Administration, highest first
const ADMINISTRATION_ROLES: MemberRoleName[] = [MemberRoles.Admin, MemberRoles.Responsable]

/**
 * Check a role the list shows
 * @param {MemberRoleName} role - Hierarchy level
 * @return {boolean} - Listed
 */

export const isListedRole = (role: MemberRoleName): boolean => !UNLISTED_ROLES.includes(role)

/**
 * Compare two names the way the list reads them
 * @param {string} left - One name
 * @param {string} right - Other name
 * @return {number} - Sort order
 */

const byName = (left: string, right: string): number => left.localeCompare(right, 'fr')

/**
 * Compare two function lists position by position, a member with none comes last
 * @param {MemberFunction[]} left - Functions in hierarchy order
 * @param {MemberFunction[]} right - Functions in hierarchy order
 * @return {number} - Sort order
 */

const byFunctions = (left: MemberFunction[], right: MemberFunction[]): number => {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const one = left[index]?.position ?? Infinity
    const other = right[index]?.position ?? Infinity
    if (one !== other) return one === Infinity ? 1 : other === Infinity ? -1 : one - other
  }

  return 0
}

/**
 * Split a box into Administration and moderators, each in reading order
 * @param {MemberSummary[]} members - Members of one creator
 * @return {ArrangedMembers} - Both sections
 */

export const arrangeMembers = (members: MemberSummary[]): ArrangedMembers => {
  const listed = members.filter((member) => isListedRole(member.role))
  const isAdministration = (member: MemberSummary) => ADMINISTRATION_ROLES.includes(member.role)

  return {
    // The Admin always opens the section
    administration: listed
      .filter(isAdministration)
      .sort(
        (left, right) =>
          ADMINISTRATION_ROLES.indexOf(left.role) - ADMINISTRATION_ROLES.indexOf(right.role) ||
          byName(left.displayName, right.displayName)
      ),
    moderators: listed
      .filter((member) => !isAdministration(member))
      .sort(
        (left, right) =>
          byFunctions(left.functions, right.functions) ||
          byName(left.displayName, right.displayName)
      ),
  }
}
