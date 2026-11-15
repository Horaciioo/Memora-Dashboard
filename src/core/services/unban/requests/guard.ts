import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { canAct } from '@/core/lib/unban/actions'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { UNBAN_COPY, UNBAN_ERRORS } from '@/declarations/unban/copy'
import { UnbanStatuses } from '@/utils/constants/unban'
import { readRequest } from './query'
import type { UnbanActionName } from '@/core/lib/unban/actions'
import type { EventInput } from '@/core/services/system/ActivityService'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'
import type { UnbanRequestDetail } from '@/types/unban'
import type { Prisma, UnbanRequest } from '@prisma/client'

/**
 * Write a request is asked to make, with the counter the client last saw
 * @typedef {Object} VersionedWrite
 * @property {string} id - Request identifier
 * @property {number} version - Counter quoted by the client
 * @property {Prisma.UnbanRequestUncheckedUpdateManyInput} data - Columns to set
 * @property {Omit<EventInput, 'actorId' | 'targetType' | 'targetId'>} event - Journal line
 * @property {boolean} [takeRace] - Lost race reads as already taken
 */

export interface VersionedWrite {
  id: string
  version: number
  data: Prisma.UnbanRequestUncheckedUpdateManyInput
  event: Omit<EventInput, 'actorId' | 'targetType' | 'targetId'>
  takeRace?: boolean
}

/**
 * Request and the counter the client last saw
 * @typedef {Object} ReviewTarget
 * @property {string} id - Request identifier
 * @property {number} version - Counter quoted by the client
 */

export interface ReviewTarget {
  id: string
  version: number
}

/**
 * Refuse an action the rules do not allow this caller on this request
 * @param {UnbanActionName} action - Thing to do
 * @param {UnbanRequest} row - Stored request
 * @param {UnbanCaller} caller - Who acts
 * @return {void}
 */

export const assertCanAct = (
  action: UnbanActionName,
  row: UnbanRequest,
  caller: UnbanCaller
): void => {
  const allowed = canAct(action, {
    status: row.status,
    assigneeId: row.assigneeId,
    actorId: caller.actorId,
    access: caller.access,
  })
  if (!allowed) throw forbidden(UNBAN_ERRORS.notAllowed)
}

/**
 * Error for a write that lost against another one, naming who got there first
 * @param {string} id - Request identifier
 * @param {boolean} takeRace - Both wanted to take it
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<Error>} - Conflict, or not found when the request is gone
 */

const staleError = async (id: string, takeRace: boolean, caller: UnbanCaller): Promise<Error> => {
  const current = await prisma.unbanRequest.findFirst({
    where: scopedWhere('unbanRequest', caller.scope, { id }),
    include: { assignee: { select: { displayName: true } } },
  })
  if (!current) return notFound()

  if (takeRace && current.status === UnbanStatuses.InReview && current.assignee) {
    return conflict(UNBAN_COPY.alreadyTaken.replace('{name}', current.assignee.displayName))
  }

  const last = await prisma.activityLog.findFirst({
    where: { targetType: 'unbanRequest', targetId: id },
    orderBy: { createdAt: 'desc' },
    select: { actor: { select: { displayName: true } } },
  })
  const name = last?.actor?.displayName

  return conflict(name ? UNBAN_COPY.conflict.replace('{name}', name) : UNBAN_COPY.conflictUnknown)
}

/**
 * Request of the perimeter as the client saw it, any other one does not exist for the caller
 * @param {ReviewTarget} target - Request and counter
 * @param {UnbanCaller} caller - Who acts
 * @param {boolean} [takeRace] - A lost race reads as already taken
 * @return {Promise<UnbanRequest>} - Stored request
 */

export const loadRequest = async (
  target: ReviewTarget,
  caller: UnbanCaller,
  takeRace = false
): Promise<UnbanRequest> => {
  const row = await prisma.unbanRequest.findFirst({
    where: scopedWhere('unbanRequest', caller.scope, { id: target.id }),
  })
  if (!row) throw notFound()
  if (row.version !== target.version) throw await staleError(target.id, takeRace, caller)

  return row
}

/**
 * Apply a write only if nobody wrote since the client read, then journal it
 * @param {VersionedWrite} write - What to write
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const writeVersioned = async (
  write: VersionedWrite,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const { count } = await prisma.unbanRequest.updateMany({
    where: scopedWhere('unbanRequest', caller.scope, { id: write.id, version: write.version }),
    data: { ...write.data, version: { increment: 1 } },
  })
  if (count === 0) throw await staleError(write.id, write.takeRace ?? false, caller)

  await recordEvent({
    ...write.event,
    actorId: caller.actorId,
    targetType: 'unbanRequest',
    targetId: write.id,
  })

  return readRequest(write.id, caller)
}
