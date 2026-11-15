import { Permissions } from '@/utils/constants/permissions'
import { UnbanStatuses } from '@/utils/constants/unban'
import type { PermissionHelpers } from '@/types/auth'
import type { PermissionName } from '@/utils/constants/permissions'
import type { UnbanStatusName } from '@/utils/constants/unban'

/**
 * Door a transition goes through, a decision has its own
 * @type {Record<string, string>}
 */

export const TransitionGates = {
  Status: 'status',
  Decision: 'decision',
} as const

export type TransitionGateName = (typeof TransitionGates)[keyof typeof TransitionGates]

/**
 * One move a request can make
 * @typedef {Object} UnbanTransition
 * @property {UnbanStatusName} to - Status reached
 * @property {PermissionName} permission - Right it takes
 * @property {TransitionGateName} gate - Door it goes through
 */

interface UnbanTransition {
  to: UnbanStatusName
  permission: PermissionName
  gate: TransitionGateName
}

const { Pending, InReview, Accepted, Refused } = UnbanStatuses
const { Status, Decision } = TransitionGates

// Reopening is the only way back from a decision
const REOPEN: UnbanTransition = { to: InReview, permission: Permissions.UnbanManage, gate: Status }

/**
 * Every allowed move, nothing else exists
 * @type {Record<UnbanStatusName, UnbanTransition[]>}
 */

export const UNBAN_TRANSITIONS: Record<UnbanStatusName, UnbanTransition[]> = {
  [Pending]: [{ to: InReview, permission: Permissions.UnbanHandle, gate: Status }],
  [InReview]: [
    { to: Pending, permission: Permissions.UnbanHandle, gate: Status },
    { to: Accepted, permission: Permissions.UnbanHandle, gate: Decision },
    { to: Refused, permission: Permissions.UnbanHandle, gate: Decision },
  ],
  [Accepted]: [REOPEN],
  [Refused]: [REOPEN],
}

/**
 * Whether a request may move from one status to another through a door
 * @param {UnbanStatusName} from - Current status
 * @param {UnbanStatusName} to - Wanted status
 * @param {PermissionHelpers} access - Rights of the caller
 * @param {TransitionGateName} [gate] - Door used
 * @return {boolean} - Allowed
 */

export const canTransition = (
  from: UnbanStatusName,
  to: UnbanStatusName,
  access: PermissionHelpers,
  gate: TransitionGateName = Status
): boolean =>
  UNBAN_TRANSITIONS[from].some(
    (move) => move.to === to && move.gate === gate && access.can(move.permission)
  )
