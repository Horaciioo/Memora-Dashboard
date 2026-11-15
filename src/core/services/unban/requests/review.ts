import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { UnbanActions } from '@/core/lib/unban/actions'
import { unbanTaskFragment } from '@/core/lib/unban/taskKey'
import { closeSystemTasks } from '@/core/services/personal/SystemTaskService'
import { notify } from '@/core/services/system/NotificationService'
import { MailKinds } from '@/utils/constants/mail'
import { mailRequester } from './mails'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { journalEvent, memberNames, statusLine } from './journal'
import { UNBAN_COPY, UNBAN_ERRORS } from '@/declarations/unban/copy'
import { Permissions } from '@/utils/constants/permissions'
import { UnbanStatuses } from '@/utils/constants/unban'
import { assertCanHandleFor } from './assignee'
import { assertCanAct, loadRequest, writeVersioned } from './guard'
import type { ReviewTarget } from './guard'
import { readRequest } from './query'
import type { UnbanCaller } from '@/core/services/unban/requests/caller'
import type { UnbanRequestDetail } from '@/types/unban'
import type { UnbanStatusName } from '@/utils/constants/unban'
import type { UnbanRequest } from '@prisma/client'

/**
 * Decision of the team
 * @typedef {Object} Decision
 * @property {string} outcome - Accepted or refused
 * @property {string | null} [reviewNote] - Answer shown to the requester
 */

export interface Decision {
  outcome: string
  reviewNote?: string | null
}

const { Pending, InReview, Accepted, Refused } = UnbanStatuses

// A decision is one of these two
const OUTCOMES: string[] = [Accepted, Refused]

/**
 * Keep a text within its bound, nothing for a blank one
 * @param {string | null | undefined} text - Text typed
 * @param {string} field - Field it belongs to
 * @param {string} [blankMessage] - Refusal for a blank text, a blank one is fine without it
 * @return {string | null} - Trimmed text
 */

const boundedText = (
  text: string | null | undefined,
  field: string,
  blankMessage?: string
): string | null => {
  const clean = text?.trim() ?? ''
  if (blankMessage && clean === '') throw invalidInput([{ field, message: blankMessage }])
  if (clean.length > UNBAN_SETTINGS.reviewNoteMaxLength) {
    throw invalidInput([{ field, message: UNBAN_ERRORS.noteTooLong }])
  }

  return clean === '' ? null : clean
}

/**
 * Take a waiting request in charge, a free one becomes the caller's
 * @param {ReviewTarget} target - Request and counter
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const takeRequest = async (
  target: ReviewTarget,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const row = await loadRequest(target, caller, true)
  assertCanAct(UnbanActions.Take, row, caller)
  const assigneeId = row.assigneeId ?? caller.actorId

  const detail = await writeVersioned(
    {
      ...target,
      takeRace: true,
      data: { status: InReview, assigneeId, statusChangedAt: new Date() },
      event: journalEvent('UnbanTaken', 'pris en charge', row, [statusLine(row.status, InReview)], {
        payload: { from: row.status, to: InReview },
      }),
    },
    caller
  )
  await closeSystemTasks(unbanTaskFragment(row.id), assigneeId)
  // Only the first look tells the requester, taking it back from a colleague stays silent
  if (row.status === Pending) mailRequester(MailKinds.UnbanTaken, row)

  return detail
}

/**
 * Hand a request back to the waiting line
 * @param {ReviewTarget} target - Request and counter
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const releaseRequest = async (
  target: ReviewTarget,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const row = await loadRequest(target, caller)
  assertCanAct(UnbanActions.Release, row, caller)

  return writeVersioned(
    {
      ...target,
      data: {
        status: Pending,
        assigneeId: null,
        cycle: { increment: 1 },
        statusChangedAt: new Date(),
      },
      event: journalEvent('UnbanReleased', 'relâché', row, [statusLine(row.status, Pending)], {
        payload: { from: row.status, to: Pending },
      }),
    },
    caller
  )
}

/**
 * Whether the move only concerns the caller, anything else is a manager's call
 * @param {string | null} assigneeId - Member wanted, null for nobody
 * @param {UnbanRequest} row - Stored request
 * @param {string} actorId - Member acting
 * @return {boolean} - Concerns the caller alone
 */

const isOwnMove = (assigneeId: string | null, row: UnbanRequest, actorId: string): boolean => {
  const takesFree =
    assigneeId === actorId && (row.assigneeId === null || row.assigneeId === actorId)
  const dropsOwn = assigneeId === null && row.assigneeId === actorId

  return takesFree || dropsOwn
}

/**
 * Whether the caller may put this member in charge
 * @param {string | null} assigneeId - Member wanted, null for nobody
 * @param {UnbanRequest} row - Stored request
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<void>} - Throws when refused
 */

const assertCanAssign = async (
  assigneeId: string | null,
  row: UnbanRequest,
  caller: UnbanCaller
): Promise<void> => {
  assertCanAct(UnbanActions.Assign, row, caller)

  const isManager = caller.access.can(Permissions.UnbanManage)
  if (!isManager && !isOwnMove(assigneeId, row, caller.actorId)) {
    throw forbidden(UNBAN_ERRORS.notAllowed)
  }
  if (assigneeId) await assertCanHandleFor(assigneeId, row.youtuberId)
}

/**
 * Put a member in charge of a request, or nobody
 * @param {ReviewTarget} target - Request and counter
 * @param {string | null} assigneeId - Member wanted, null for nobody
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const assignRequest = async (
  target: ReviewTarget,
  assigneeId: string | null,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const row = await loadRequest(target, caller)
  await assertCanAssign(assigneeId, row, caller)
  const names = await memberNames([assigneeId, row.assigneeId])

  const detail = await writeVersioned(
    {
      ...target,
      // A new cycle, so the ones who lost it find it again if it comes back
      data: { assigneeId, cycle: { increment: 1 } },
      event: journalEvent(
        'UnbanAssigned',
        'attribué',
        row,
        [
          {
            label: UNBAN_COPY.journalAssignee,
            before: names.get(row.assigneeId ?? '') ?? UNBAN_COPY.journalNobody,
            after: names.get(assigneeId ?? '') ?? UNBAN_COPY.journalNobody,
          },
        ],
        { payload: { assigneeId, previousAssigneeId: row.assigneeId } }
      ),
    },
    caller
  )

  if (assigneeId) await closeSystemTasks(unbanTaskFragment(row.id), assigneeId)
  await notify({
    kind: 'UnbanAssigned',
    recipients: [assigneeId],
    actorId: caller.actorId,
    target: 'unbanRequest',
    targetId: row.id,
    subject: row.reference,
  })

  return detail
}

/**
 * Decide a request in review
 * @param {ReviewTarget} target - Request and counter
 * @param {Decision} decision - Outcome and answer to the requester
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const decideRequest = async (
  target: ReviewTarget,
  decision: Decision,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  if (!OUTCOMES.includes(decision.outcome)) {
    throw invalidInput([{ field: 'outcome', message: UNBAN_ERRORS.badOutcome }])
  }

  const outcome = decision.outcome === Accepted ? Accepted : Refused
  const row = await loadRequest(target, caller)
  assertCanAct(outcome === Accepted ? UnbanActions.Accept : UnbanActions.Refuse, row, caller)
  const note = boundedText(decision.reviewNote, 'reviewNote')
  const now = new Date()

  const detail = await writeVersioned(
    {
      ...target,
      data: {
        status: outcome,
        reviewNote: encryptField(note),
        decidedAt: now,
        decidedById: caller.actorId,
        statusChangedAt: now,
      },
      // The answer to the requester never enters the journal
      event: journalEvent(
        'UnbanDecided',
        outcome === Accepted ? 'accepté' : 'refusé',
        row,
        [statusLine(row.status, outcome as UnbanStatusName)],
        { payload: { from: row.status, to: outcome, outcome } }
      ),
    },
    caller
  )
  await closeSystemTasks(unbanTaskFragment(row.id))
  mailRequester(outcome === Accepted ? MailKinds.UnbanAccepted : MailKinds.UnbanRefused, row, note)

  return detail
}

/**
 * Reopen a decided request, the reason stays in the journal
 * @param {ReviewTarget} target - Request and counter
 * @param {string} reason - Why it is reopened
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const reopenRequest = async (
  target: ReviewTarget,
  reason: string,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const row = await loadRequest(target, caller)
  assertCanAct(UnbanActions.Reopen, row, caller)
  const why = boundedText(reason, 'reason', UNBAN_ERRORS.reasonRequired)

  return writeVersioned(
    {
      ...target,
      data: {
        status: InReview,
        decidedAt: null,
        decidedById: null,
        discordLiftedAt: null,
        discordLiftedById: null,
        cycle: { increment: 1 },
        statusChangedAt: new Date(),
      },
      event: journalEvent(
        'UnbanReopened',
        'rouvert',
        row,
        [
          statusLine(row.status, InReview),
          { label: UNBAN_COPY.journalReason, before: null, after: why },
        ],
        {
          payload: {
            from: row.status,
            to: InReview,
            reason: why,
            decidedAt: row.decidedAt?.toISOString() ?? null,
          },
        }
      ),
    },
    caller
  )
}

/**
 * Confirm the ban was lifted on Discord, a second call changes nothing
 * @param {ReviewTarget} target - Request and counter
 * @param {UnbanCaller} caller - Who acts
 * @return {Promise<UnbanRequestDetail>} - Request as it stands now
 */

export const markDiscordLifted = async (
  target: ReviewTarget,
  caller: UnbanCaller
): Promise<UnbanRequestDetail> => {
  const row = await loadRequest(target, caller)
  assertCanAct(UnbanActions.Lift, row, caller)
  if (row.discordLiftedAt) return readRequest(target.id, caller)

  return writeVersioned(
    {
      ...target,
      data: { discordLiftedAt: new Date(), discordLiftedById: caller.actorId },
      event: journalEvent('UnbanDiscordLifted', 'confirmé le débannissement Discord de', row),
    },
    caller
  )
}
