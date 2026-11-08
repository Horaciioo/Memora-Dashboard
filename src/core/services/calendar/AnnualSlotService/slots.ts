import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { syncRoster } from '@/core/services/calendar/attendance'
import { notify } from '@/core/services/system/NotificationService'
import { defaultState } from '@/core/services/work/shared'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import {
  AttendeeKinds,
  CalendarKinds,
  WorkflowPhases,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import { formatDayTime } from '@/utils/format/time/dates'
import {
  everyResponsable,
  leadsOf,
  moderatorsOfTeam,
} from '@/core/services/calendar/AnnualSlotService/shared'

/**
 * Close the task that asked a Moderator to choose, or open it again
 * @param {string} projectId - Series
 * @param {string} accountId - Moderator
 * @param {'done' | 'todo'} to - Where the task goes
 * @return {Promise<void>} - Moved
 */

const moveTask = async (
  projectId: string,
  accountId: string,
  to: 'done' | 'todo'
): Promise<void> => {
  const state =
    to === 'done'
      ? await prisma.workflowState.findFirst({
          where: { scope: WorkflowScopes.Task, phase: WorkflowPhases.Done },
          orderBy: { position: 'asc' },
        })
      : { id: await defaultState(WorkflowScopes.Task) }
  if (!state?.id) return

  await prisma.task.updateMany({
    where: { systemKey: `annual-slot:${projectId}:${accountId}` },
    data: { stateId: state.id },
  })
}

/**
 * Free a slot: no name, no roll-call
 * @param {string} eventId - Slot identifier
 * @return {Promise<void>} - Freed
 */

const freeSlot = async (eventId: string): Promise<void> => {
  await prisma.eventAttendance.deleteMany({ where: { eventId } })
  await prisma.calendarEvent.update({
    where: { id: eventId },
    data: { accountId: null, title: ANNUAL_REVIEW_COPY.eventTitle, rollCall: false },
  })
}

/**
 * Give a slot to a Moderator, the one they held in the series is freed, the card of the Réunions page is filed
 * @param {string} eventId - Slot identifier
 * @param {string} accountId - Moderator
 * @param {string | null} placedBy - Responsable placing them, none when they chose
 * @return {Promise<void>} - Given
 */

const giveSlot = async (
  eventId: string,
  accountId: string,
  placedBy: string | null
): Promise<void> => {
  const slot = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: { template: { select: { slotMinutes: true } } },
  })
  // The period band is never a slot
  if (!slot?.template?.slotMinutes || !slot.projectId || slot.kind !== CalendarKinds.Event) {
    throw notFound()
  }

  const moderator = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { displayName: true, role: true },
  })
  if (moderator.role !== MemberRoles.Moderateur) {
    throw forbidden(ANNUAL_REVIEW_COPY.notModerator)
  }
  if (slot.accountId) throw conflict(ANNUAL_REVIEW_COPY.slotRaced)

  // Only the Moderators of the team the series is for
  if (slot.audienceTeamId) {
    const member = await prisma.teamMember.count({
      where: { teamId: slot.audienceTeamId, accountId },
    })
    if (member === 0) throw forbidden(ANNUAL_REVIEW_COPY.notInTeam)
  }

  // Two Moderators on one slot: only the first write wins
  const title = ANNUAL_REVIEW_COPY.takenTitle.replace('{name}', moderator.displayName)
  const taken = await prisma.calendarEvent.updateMany({
    where: { id: eventId, accountId: null },
    data: { accountId, title },
  })
  if (taken.count === 0) throw conflict(ANNUAL_REVIEW_COPY.slotRaced)

  // One slot per series, freed once the new one holds
  const held = await prisma.calendarEvent.findMany({
    where: { projectId: slot.projectId, accountId, id: { not: eventId } },
    select: { id: true },
  })
  for (const entry of held) await freeSlot(entry.id)

  const leads = await leadsOf(accountId)

  await moveTask(slot.projectId, accountId, 'done')

  if (placedBy) {
    // A Responsable placed them: the Moderator confirms they come
    await prisma.calendarEvent.update({ where: { id: eventId }, data: { rollCall: true } })
    await syncRoster(eventId, [accountId])
    await notify({
      kind: 'AttendanceRequested',
      recipients: [accountId],
      actorId: placedBy,
      target: 'calendar',
      targetId: eventId,
      subject: formatDayTime(slot.startsAt),
    })

    return
  }

  await notify({
    kind: 'AnnualSlotTaken',
    recipients: leads.length > 0 ? leads : await everyResponsable(),
    actorId: accountId,
    target: 'calendar',
    targetId: eventId,
    subject: formatDayTime(slot.startsAt),
  })
}

/**
 * Guard a series by its team creator
 * @param {string} eventId - Any entry of the series
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Throws out of perimeter
 */

export const assertSeriesInScope = async (eventId: string, scope: AccessScope): Promise<void> => {
  if (scope.isGlobal) return

  const entry = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { audienceTeamId: true },
  })
  if (!entry) throw notFound()
  if (!entry.audienceTeamId) return

  const team = await prisma.team.findUnique({
    where: { id: entry.audienceTeamId },
    select: { youtuberId: true },
  })
  if (team?.youtuberId && !scope.youtuberIds.includes(team.youtuberId)) throw notFound()
}

/**
 * Take an open slot as a Moderator
 * @param {string} eventId - Slot identifier
 * @param {string} accountId - Moderator taking it
 * @return {Promise<string[]>} - Slots that changed
 */

export const takeSlot = async (eventId: string, accountId: string): Promise<string[]> => {
  const held = await heldSlots(eventId, accountId)
  await giveSlot(eventId, accountId, null)
  await syncSeriesMeeting(eventId)

  return [eventId, ...held]
}

/**
 * Place a Moderator on an open slot as a Responsable
 * @param {string} eventId - Slot identifier
 * @param {string} accountId - Moderator placed
 * @param {string} actorId - Responsable placing them
 * @return {Promise<string[]>} - Slots that changed
 */

export const placeSlot = async (
  eventId: string,
  accountId: string,
  actorId: string
): Promise<string[]> => {
  const held = await heldSlots(eventId, accountId)
  await giveSlot(eventId, accountId, actorId)
  await syncSeriesMeeting(eventId)

  return [eventId, ...held]
}

/**
 * Bring the card of the Réunions page up to date: who holds which slot, who runs it, who attends
 * @param {string} eventId - Any slot of the series
 * @return {Promise<void>} - Card refreshed
 */

const syncSeriesMeeting = async (eventId: string): Promise<void> => {
  const slot = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { projectId: true },
  })
  if (!slot?.projectId) return

  const period = await prisma.calendarEvent.findFirst({
    where: { projectId: slot.projectId, kind: CalendarKinds.Period },
    select: { meetingId: true, audienceTeamId: true },
  })
  if (!period?.meetingId) return

  const [card, taken] = await Promise.all([
    prisma.meeting.findUnique({
      where: { id: period.meetingId },
      select: { createdById: true },
    }),
    prisma.calendarEvent.findMany({
      where: { projectId: slot.projectId, kind: CalendarKinds.Event, accountId: { not: null } },
      orderBy: { startsAt: 'asc' },
      select: { startsAt: true, accountId: true, subject: { select: { displayName: true } } },
    }),
  ])

  // Everyone the series concerns attends, not only those who chose already
  const moderatorIds = period.audienceTeamId
    ? await moderatorsOfTeam(period.audienceTeamId)
    : taken.flatMap((entry) => (entry.accountId ? [entry.accountId] : []))
  const leadIds = new Set<string>(card?.createdById ? [card.createdById] : [])
  const teamLeads = period.audienceTeamId
    ? await prisma.teamLead.findMany({
        where: { teamId: period.audienceTeamId },
        select: { accountId: true },
      })
    : []
  for (const lead of teamLeads) leadIds.add(lead.accountId)

  await prisma.meeting.update({
    where: { id: period.meetingId },
    data: {
      introduction:
        taken.length === 0
          ? ANNUAL_REVIEW_COPY.noSlotYet
          : taken
              .map((entry) => `- ${formatDayTime(entry.startsAt)} : ${entry.subject?.displayName}`)
              .join('\n'),
      attendees: {
        deleteMany: {},
        create: [
          ...[...leadIds].map((accountId) => ({ accountId, kind: AttendeeKinds.Lead })),
          ...[...new Set(moderatorIds)]
            .filter((accountId) => !leadIds.has(accountId))
            .map((accountId) => ({ accountId, kind: AttendeeKinds.Participant })),
        ],
      },
    },
  })
}

/**
 * Slots of the series of an entry a Moderator already holds
 * @param {string} eventId - Slot identifier
 * @param {string} accountId - Moderator
 * @return {Promise<string[]>} - Slot identifiers
 */

const heldSlots = async (eventId: string, accountId: string): Promise<string[]> => {
  const slot = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { projectId: true },
  })
  if (!slot?.projectId) return []

  const held = await prisma.calendarEvent.findMany({
    where: { projectId: slot.projectId, accountId },
    select: { id: true },
  })

  return held.map((entry) => entry.id)
}

/**
 * Cancel a taken slot, or move its Moderator to another open slot of the series
 * @param {string} eventId - Slot identifier
 * @param {string | null} moveTo - Open slot they move to, none cancels
 * @param {string} actorId - Responsable deciding
 * @return {Promise<string[]>} - Slots that changed
 */

export const cancelSlot = async (
  eventId: string,
  moveTo: string | null,
  actorId: string
): Promise<string[]> => {
  const slot = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { accountId: true, projectId: true, startsAt: true },
  })
  if (!slot?.accountId || !slot.projectId) throw notFound()

  const target = moveTo
    ? await prisma.calendarEvent.findUnique({
        where: { id: moveTo },
        select: { accountId: true, projectId: true },
      })
    : null
  if (moveTo && (!target || target.accountId || target.projectId !== slot.projectId)) {
    throw conflict(ANNUAL_REVIEW_COPY.slotRaced)
  }

  const accountId = slot.accountId

  // Moving frees the old slot itself
  if (moveTo) {
    await giveSlot(moveTo, accountId, actorId)
    await syncSeriesMeeting(eventId)

    return [eventId, moveTo]
  }

  await freeSlot(eventId)

  // Cancelled: the Moderator is told and has to choose again
  await syncSeriesMeeting(eventId)
  await moveTask(slot.projectId, accountId, 'todo')
  await notify({
    kind: 'AnnualSlotCancelled',
    recipients: [accountId],
    actorId,
    target: 'calendar',
    targetId: eventId,
    subject: formatDayTime(slot.startsAt),
  })

  return [eventId]
}

/**
 * Moderators of a series who hold no slot yet
 * @param {string} eventId - Slot of the series
 * @return {Promise<{ id: string, name: string, avatar: string | null }[]>} - Moderators still to place
 */

export const placeable = async (
  eventId: string
): Promise<{ id: string; name: string; avatar: string | null }[]> => {
  const slot = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { projectId: true, audienceTeamId: true },
  })
  if (!slot?.projectId) return []

  const taken = await prisma.calendarEvent.findMany({
    where: { projectId: slot.projectId, accountId: { not: null } },
    select: { accountId: true },
  })
  const rows = await prisma.account.findMany({
    where: {
      role: MemberRoles.Moderateur,
      status: { notIn: GONE_MEMBER_STATUSES },
      ...(slot.audienceTeamId
        ? { teamMemberships: { some: { teamId: slot.audienceTeamId } } }
        : {}),
      id: { notIn: taken.flatMap((entry) => (entry.accountId ? [entry.accountId] : [])) },
    },
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true, avatarUrl: true },
  })

  return rows.map((row) => ({ id: row.id, name: row.displayName, avatar: row.avatarUrl }))
}
