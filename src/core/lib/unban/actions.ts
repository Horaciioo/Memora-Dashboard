import { canTransition, TransitionGates } from '@/core/lib/unban/transitions'
import { Permissions } from '@/utils/constants/permissions'
import { UnbanStatuses } from '@/utils/constants/unban'
import type { PermissionHelpers } from '@/types/auth'
import type { UnbanStatusName } from '@/utils/constants/unban'

/**
 * Things a member can do to a request
 * @type {Record<string, string>}
 */

export const UnbanActions = {
  Take: 'take',
  Release: 'release',
  Assign: 'assign',
  Accept: 'accept',
  Refuse: 'refuse',
  Reopen: 'reopen',
  Lift: 'lift',
} as const

export type UnbanActionName = (typeof UnbanActions)[keyof typeof UnbanActions]

/**
 * What a rule needs to know of a request and of who acts
 * @typedef {Object} ActionContext
 * @property {UnbanStatusName} status - Status of the request
 * @property {string | null} assigneeId - Member it is assigned to
 * @property {string} actorId - Member acting
 * @property {PermissionHelpers} access - Rights of the member
 */

export interface ActionContext {
  status: UnbanStatusName
  assigneeId: string | null
  actorId: string
  access: PermissionHelpers
}

const { Pending, InReview, Accepted, Refused } = UnbanStatuses
const { Status, Decision } = TransitionGates

/**
 * An assigned request answers to its assignee, a manager can step in
 * @param {ActionContext} context - Request and caller
 * @return {boolean} - Allowed
 */

const ownsRequest = ({ assigneeId, actorId, access }: ActionContext): boolean =>
  assigneeId === null || assigneeId === actorId || access.can(Permissions.UnbanManage)

const RULES: Record<UnbanActionName, (context: ActionContext) => boolean> = {
  // A decided request is reopened, never taken
  [UnbanActions.Take]: (c) =>
    c.status === Pending && canTransition(c.status, InReview, c.access, Status) && ownsRequest(c),
  [UnbanActions.Release]: (c) =>
    canTransition(c.status, Pending, c.access, Status) && ownsRequest(c),
  // Moderators vote, the Discord lead decides
  [UnbanActions.Accept]: (c) =>
    canTransition(c.status, Accepted, c.access, Decision) && c.access.can(Permissions.UnbanManage),
  [UnbanActions.Refuse]: (c) =>
    canTransition(c.status, Refused, c.access, Decision) && c.access.can(Permissions.UnbanManage),
  [UnbanActions.Reopen]: (c) => canTransition(c.status, InReview, c.access, Status),
  [UnbanActions.Lift]: (c) => c.status === Accepted && c.access.can(Permissions.UnbanHandle),
  [UnbanActions.Assign]: (c) =>
    (c.status === Pending || c.status === InReview) && c.access.can(Permissions.UnbanHandle),
}

/**
 * Whether the member may do something to the request
 * @param {UnbanActionName} action - Thing to do
 * @param {ActionContext} context - Request and caller
 * @return {boolean} - Allowed
 */

export const canAct = (action: UnbanActionName, context: ActionContext): boolean =>
  RULES[action](context)

/**
 * Everything the member may do to the request, in display order
 * @param {ActionContext} context - Request and caller
 * @return {UnbanActionName[]} - Allowed actions
 */

export const allowedActions = (context: ActionContext): UnbanActionName[] =>
  Object.values(UnbanActions).filter((action) => canAct(action, context))
