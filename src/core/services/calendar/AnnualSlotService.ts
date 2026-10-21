import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { openDays, slotClocks } from '@/core/lib/calendar/annualSlots'
import { emojiOrRandom } from '@/core/lib/work'
import { syncRoster } from '@/core/services/calendar/attendance'
import { notify } from '@/core/services/system/NotificationService'
import { openMeetingForEntry } from '@/core/services/work/MeetingService'
import { defaultState } from '@/core/services/work/shared'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import { ADMIN_ROLES, GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import {
  AttendanceStatuses,
  AttendeeKinds,
  CalendarKinds,
  EventVisibilities,
  MeetingAudiences,
  WorkflowPhases,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import { formatDayTime } from '@/utils/format/dates'
import { instantToWall, wallToInstant } from '@/utils/format/zone'

// Priority and platform every project of the annual reviews starts with
const PROJECT_PRIORITY = 'Normale'
const PROJECT_PLATFORM = 'Discord'

// Key every project of the annual reviews is filed under, followed by its number
const PROJECT_KEY = 'annual-reviews:'

/**
 * What opening a series of slots made
 * @typedef {Object} OpenedSlots
 * @property {string} projectId - Project of the series
 * @property {number} number - Number of the series
 * @property {string} firstDay - First ISO day
 */

export interface OpenedSlots {
  projectId: string
  number: number
  firstDay: string
}

/**
 * Open a series of annual review slots: empty entries on the calendar, their project and the tasks that follow
 * @param {Object} input - Series
 * @param {string} input.templateId - Annual reviews model
 * @param {string} input.teamId - Team whose Moderators are concerned
 * @param {Date} input.startsAt - First day, at the opening hour
 * @param {Date | null} input.endsAt - Last day, at the closing hour
 * @param {string} actorId - Responsable opening it
 * @return {Promise<OpenedSlots>} - Project and first day
 */

export const openAnnualSlots = async (
  input: { templateId: string; teamId: string; startsAt: Date; endsAt: Date | null },
  actorId: string
): Promise<OpenedSlots> => {
  const template = await prisma.eventTemplate.findUniqueOrThrow({
    where: { id: input.templateId },
  })
  const step = template.slotMinutes ?? 15

  // A Responsable opens it for a team they lead, an Administrator for any
  const [led, actor] = await Promise.all([
    prisma.teamLead.count({ where: { teamId: input.teamId, accountId: actorId } }),
    prisma.account.findUniqueOrThrow({ where: { id: actorId }, select: { role: true } }),
  ])
  if (led === 0 && !ADMIN_ROLES.includes(actor.role)) throw forbidden()

  if (!input.endsAt || input.endsAt <= input.startsAt) {
    throw invalidInput([{ field: 'endsAt', message: ANNUAL_REVIEW_COPY.badRange }])
  }

  // Days come from the dates, hours from the clock of each end
  const firstDay = instantToWall(input.startsAt).slice(0, 10)
  const lastDay = instantToWall(input.endsAt).slice(0, 10)
  const opening = instantToWall(input.startsAt).slice(11, 16)
  const closing = instantToWall(input.endsAt).slice(11, 16)
  const clocks = slotClocks(opening, closing, step)
  const days = openDays(firstDay, lastDay)
  if (clocks.length === 0 || days.length === 0) {
    throw invalidInput([{ field: 'endsAt', message: ANNUAL_REVIEW_COPY.badRange }])
  }

  // The project of a series carries a growing number
  const number =
    (await prisma.project.count({ where: { systemKey: { startsWith: PROJECT_KEY } } })) + 1
  // The project is filled in from the team: its Responsables, its creator, a middling priority, Discord, the end of the series as deadline
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: input.teamId },
    select: { youtuberId: true, leads: { select: { accountId: true } } },
  })
  const [priority, platform] = await Promise.all([
    prisma.priority.findFirst({ where: { name: PROJECT_PRIORITY }, select: { id: true } }),
    prisma.platform.findFirst({ where: { name: PROJECT_PLATFORM }, select: { id: true } }),
  ])
  const leadIds = [...new Set([actorId, ...team.leads.map((lead) => lead.accountId)])]
  const project = await prisma.project.create({
    data: {
      title: `${ANNUAL_REVIEW_COPY.title} #${number}`,
      emoji: emojiOrRandom(null),
      stateId: await defaultState(WorkflowScopes.Project),
      priorityId: priority?.id ?? null,
      platformId: platform?.id ?? null,
      deadline: input.endsAt,
      systemKey: `${PROJECT_KEY}${number}`,
      createdById: actorId,
      youtubers: { connect: team.youtuberId ? [{ id: team.youtuberId }] : [] },
      leads: { create: leadIds.map((accountId) => ({ accountId })) },
    },
    select: { id: true },
  })

  const slots = days.flatMap((day) =>
    clocks.map((clock) => {
      const startsAt = wallToInstant(`${day}T${clock}`)

      return {
        title: ANNUAL_REVIEW_COPY.eventTitle,
        kind: CalendarKinds.Event,
        templateId: template.id,
        visibility: EventVisibilities.Team,
        audienceTeamId: input.teamId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + step * 60_000),
        projectId: project.id,
        ownerId: actorId,
      }
    })
  )
  await prisma.calendarEvent.createMany({ data: slots })

  // The period of the series spans its days, the slots sit inside it
  const period = await prisma.calendarEvent.create({
    data: {
      title: `${ANNUAL_REVIEW_COPY.title} #${number}`,
      kind: CalendarKinds.Period,
      templateId: template.id,
      visibility: EventVisibilities.Team,
      audienceTeamId: input.teamId,
      // The hours stay on the period, it is drawn over whole days all the same
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      allDay: true,
      projectId: project.id,
      ownerId: actorId,
    },
    select: { id: true },
  })

  // One card on the Réunions page carries the whole series
  const meetingId = await openMeetingForEntry({
    title: `${ANNUAL_REVIEW_COPY.title} #${number}`,
    emoji: null,
    startsAt: slots[0]?.startsAt ?? input.startsAt,
    endsAt: null,
    audience: MeetingAudiences.Team,
    youtuberId: team.youtuberId,
    leadIds,
    participantIds: await moderatorsOfTeam(input.teamId),
    actorId,
  })
  await prisma.meeting.update({
    where: { id: meetingId },
    data: { projectId: project.id, introduction: ANNUAL_REVIEW_COPY.noSlotYet },
  })
  await prisma.calendarEvent.update({ where: { id: period.id }, data: { meetingId } })

  await openTasks({
    projectId: project.id,
    teamId: input.teamId,
    actorId,
    firstDay,
    lastSlot: slots.at(-1)?.startsAt ?? input.endsAt,
  })

  return { projectId: project.id, number, firstDay }
}

/**
 * Moderators sitting in a team
 * @param {string} teamId - Team identifier
 * @return {Promise<string[]>} - Account identifiers
 */

const moderatorsOfTeam = async (teamId: string): Promise<string[]> =>
  (
    await prisma.account.findMany({
      where: {
        role: MemberRoles.Moderateur,
        status: { notIn: GONE_MEMBER_STATUSES },
        teamMemberships: { some: { teamId } },
      },
      select: { id: true },
    })
  ).map((row) => row.id)

/**
 * Open the tasks of a series: each Moderator chooses a slot, the Responsables prepare the questions
 * @param {Object} input - Series
 * @param {string} input.projectId - Project of the series
 * @param {string} input.teamId - Team the series is for
 * @param {string} input.actorId - Responsable who opened it
 * @param {string} input.firstDay - First ISO day
 * @param {Date} input.lastSlot - Start of the last slot
 * @return {Promise<void>} - Tasks opened
 */

const openTasks = async ({
  projectId,
  teamId,
  actorId,
  firstDay,
  lastSlot,
}: {
  projectId: string
  teamId: string
  actorId: string
  firstDay: string
  lastSlot: Date
}): Promise<void> => {
  const [moderators, responsables, todoId] = await Promise.all([
    prisma.account.findMany({
      where: {
        role: MemberRoles.Moderateur,
        status: { notIn: GONE_MEMBER_STATUSES },
        teamMemberships: { some: { teamId } },
      },
      select: { id: true },
    }),
    // The Responsables of the team prepare the questions
    prisma.account.findMany({
      where: { ledTeams: { some: { teamId } }, status: { notIn: GONE_MEMBER_STATUSES } },
      select: { id: true },
    }),
    defaultState(WorkflowScopes.Task),
  ])

  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      ...moderators.map((moderator) => ({
        systemKey: `annual-slot:${projectId}:${moderator.id}`,
        title: ANNUAL_REVIEW_COPY.taskTitle,
        description: ANNUAL_REVIEW_COPY.taskBody,
        href: ROUTES.calendarDay(firstDay),
        dueDate: lastSlot,
        ownerId: moderator.id,
        stateId: todoId,
        createdById: actorId,
      })),
      // The Responsables, the author first, prepare what will be asked
      ...[...new Set([actorId, ...responsables.map((row) => row.id)])].map((accountId) => ({
        systemKey: `annual-questions:${projectId}:${accountId}`,
        title: ANNUAL_REVIEW_COPY.questionsTitle,
        description: ANNUAL_REVIEW_COPY.questionsBody,
        href: ROUTES.project(projectId),
        dueDate: lastSlot,
        ownerId: accountId,
        stateId: todoId,
        createdById: actorId,
      })),
    ],
  })
}

/**
 * Responsables of the teams a Moderator sits in, empty when they have none
 * @param {string} accountId - Moderator
 * @return {Promise<string[]>} - Account identifiers
 */

const leadsOf = async (accountId: string): Promise<string[]> => {
  const leads = await prisma.teamLead.findMany({
    where: { team: { archived: false, members: { some: { accountId } } } },
    select: { accountId: true },
  })

  return [...new Set(leads.map((lead) => lead.accountId))]
}

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
  if (!slot?.template?.slotMinutes || !slot.projectId) throw notFound()

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

  // A Moderator holds one slot of a series at a time, the first one is freed
  const held = await prisma.calendarEvent.findMany({
    where: { projectId: slot.projectId, accountId },
    select: { id: true },
  })
  for (const entry of held) await freeSlot(entry.id)

  // Two Moderators on one slot: only the first write wins
  const title = ANNUAL_REVIEW_COPY.takenTitle.replace('{name}', moderator.displayName)
  const taken = await prisma.calendarEvent.updateMany({
    where: { id: eventId, accountId: null },
    data: { accountId, title },
  })
  if (taken.count === 0) throw conflict(ANNUAL_REVIEW_COPY.slotRaced)

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
 * Every Responsable, told when a Moderator without a team takes a slot
 * @return {Promise<string[]>} - Account identifiers
 */

const everyResponsable = async (): Promise<string[]> =>
  (
    await prisma.account.findMany({
      where: { role: MemberRoles.Responsable, status: { notIn: GONE_MEMBER_STATUSES } },
      select: { id: true },
    })
  ).map((row) => row.id)

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
  await freeSlot(eventId)

  if (moveTo) {
    await giveSlot(moveTo, accountId, actorId)
    await syncSeriesMeeting(eventId)

    return [eventId, moveTo]
  }

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

// Days before the end of a series a Moderator without a slot is reminded
const REMINDER_DAYS = 2

/**
 * Remind, once, the Moderators who still hold no slot when a series is two days from its end
 * @return {Promise<void>} - Reminders sent
 */

export const sweepAnnualReminders = async (): Promise<void> => {
  const now = new Date()
  const series = await prisma.calendarEvent.groupBy({
    by: ['projectId'],
    where: {
      kind: CalendarKinds.Event,
      template: { slotMinutes: { not: null } },
      projectId: { not: null },
    },
    _max: { startsAt: true },
  })

  for (const row of series) {
    const last = row._max.startsAt
    if (!row.projectId || !last) continue
    if (now < new Date(last.getTime() - REMINDER_DAYS * 86_400_000) || now >= last) continue

    const teamId = (
      await prisma.calendarEvent.findFirst({
        where: { projectId: row.projectId, audienceTeamId: { not: null } },
        select: { audienceTeamId: true },
      })
    )?.audienceTeamId
    const [todoId, moderators, held, reminded] = await Promise.all([
      defaultState(WorkflowScopes.Task),
      prisma.account.findMany({
        where: {
          role: MemberRoles.Moderateur,
          status: { notIn: GONE_MEMBER_STATUSES },
          ...(teamId ? { teamMemberships: { some: { teamId } } } : {}),
        },
        select: { id: true },
      }),
      prisma.calendarEvent.findMany({
        where: { projectId: row.projectId, accountId: { not: null } },
        select: { accountId: true },
      }),
      prisma.task.findMany({
        where: { systemKey: { startsWith: `annual-reminder:${row.projectId}:` } },
        select: { systemKey: true },
      }),
    ])
    const holders = new Set(held.map((entry) => entry.accountId))
    const done = new Set(reminded.map((task) => task.systemKey))
    const waiting = moderators.filter(
      (moderator) =>
        !holders.has(moderator.id) && !done.has(`annual-reminder:${row.projectId}:${moderator.id}`)
    )
    if (waiting.length === 0) continue

    // The task is the mark that the reminder went out, it also stays in their list
    await prisma.task.createMany({
      skipDuplicates: true,
      data: waiting.map((moderator) => ({
        systemKey: `annual-reminder:${row.projectId}:${moderator.id}`,
        title: ANNUAL_REVIEW_COPY.reminderTitle,
        description: ANNUAL_REVIEW_COPY.taskBody,
        href: ROUTES.calendarDay(last.toISOString().slice(0, 10)),
        dueDate: last,
        ownerId: moderator.id,
        stateId: todoId,
      })),
    })
    await notify({
      kind: 'AnnualReviewReminder',
      recipients: waiting.map((moderator) => moderator.id),
      target: 'calendar',
      targetId: row.projectId,
    })
  }
}

/**
 * Once every Moderator of the team holds a slot and said they come, the slots nobody took go
 * @param {string} eventId - Any entry of the series
 * @return {Promise<string[]>} - Slots removed
 */

export const closeSeriesIfComplete = async (eventId: string): Promise<string[]> => {
  const entry = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { projectId: true, audienceTeamId: true, template: { select: { slotMinutes: true } } },
  })
  if (!entry?.projectId || !entry.template?.slotMinutes) return []

  const [moderators, taken] = await Promise.all([
    prisma.account.findMany({
      where: {
        role: MemberRoles.Moderateur,
        status: { notIn: GONE_MEMBER_STATUSES },
        ...(entry.audienceTeamId
          ? { teamMemberships: { some: { teamId: entry.audienceTeamId } } }
          : {}),
      },
      select: { id: true },
    }),
    prisma.calendarEvent.findMany({
      where: { projectId: entry.projectId, kind: CalendarKinds.Event, accountId: { not: null } },
      select: {
        accountId: true,
        rollCall: true,
        attendances: { select: { accountId: true, status: true } },
      },
    }),
  ])
  if (moderators.length === 0) return []

  // A slot taken by the Moderator counts as a yes, a placed one waits for their answer
  const isPresent = (accountId: string): boolean =>
    taken.some(
      (slot) =>
        slot.accountId === accountId &&
        (!slot.rollCall ||
          slot.attendances.some(
            (seat) => seat.accountId === accountId && seat.status === AttendanceStatuses.Present
          ))
    )
  if (!moderators.every((moderator) => isPresent(moderator.id))) return []

  return removeOpenSlotsOf(entry.projectId)
}

/**
 * Remove the slots of a series that nobody took
 * @param {string} projectId - Series
 * @return {Promise<string[]>} - Slots removed
 */

const removeOpenSlotsOf = async (projectId: string): Promise<string[]> => {
  const open = await prisma.calendarEvent.findMany({
    where: { projectId, kind: CalendarKinds.Event, accountId: null },
    select: { id: true },
  })
  await prisma.calendarEvent.deleteMany({ where: { id: { in: open.map((slot) => slot.id) } } })

  return open.map((slot) => slot.id)
}

/**
 * A Responsable removes the slots nobody took
 * @param {string} eventId - Any entry of the series
 * @return {Promise<string[]>} - Slots removed
 */

export const removeOpenSlots = async (eventId: string): Promise<string[]> => {
  const entry = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { projectId: true, template: { select: { slotMinutes: true } } },
  })
  if (!entry?.projectId || !entry.template?.slotMinutes) throw notFound()

  return removeOpenSlotsOf(entry.projectId)
}

/**
 * Change the days and hours of a series: slots nobody took move with them, the ones taken stay where they are
 * @param {string} periodId - Period of the series
 * @param {Object} input - New days and hours
 * @param {string} input.firstDay - First ISO day
 * @param {string} input.lastDay - Last ISO day
 * @param {string} input.from - Opening wall clock
 * @param {string} input.to - Closing wall clock
 * @return {Promise<{ created: string[], removed: string[] }>} - Slots made and slots dropped
 */

export const reshapeSeries = async (
  periodId: string,
  input: { firstDay: string; lastDay: string; from: string; to: string }
): Promise<{ created: string[]; removed: string[] }> => {
  const period = await prisma.calendarEvent.findUnique({
    where: { id: periodId },
    include: { template: { select: { slotMinutes: true } } },
  })
  if (!period?.projectId || !period.template?.slotMinutes) throw notFound()

  const step = period.template.slotMinutes
  const startsAt = wallToInstant(`${input.firstDay}T${input.from}`)
  const endsAt = wallToInstant(`${input.lastDay}T${input.to}`)
  const clocks = slotClocks(input.from, input.to, step)
  const days = openDays(input.firstDay, input.lastDay)
  if (endsAt <= startsAt || clocks.length === 0 || days.length === 0) {
    throw invalidInput([{ field: 'slotDays', message: ANNUAL_REVIEW_COPY.badRange }])
  }

  const wanted = days.flatMap((day) => clocks.map((clock) => wallToInstant(`${day}T${clock}`)))
  const wantedKeys = new Set(wanted.map((slot) => slot.getTime()))

  const existing = await prisma.calendarEvent.findMany({
    where: { projectId: period.projectId, kind: CalendarKinds.Event },
    select: { id: true, startsAt: true, accountId: true },
  })
  const heldKeys = new Set(existing.map((slot) => slot.startsAt.getTime()))

  // Free slots outside the new days and hours go, taken ones are never moved under someone
  const removed = existing
    .filter((slot) => !slot.accountId && !wantedKeys.has(slot.startsAt.getTime()))
    .map((slot) => slot.id)
  await prisma.calendarEvent.deleteMany({ where: { id: { in: removed } } })

  const missing = wanted.filter((slot) => !heldKeys.has(slot.getTime()))
  const created: string[] = []
  for (const slot of missing) {
    const row = await prisma.calendarEvent.create({
      data: {
        title: ANNUAL_REVIEW_COPY.eventTitle,
        kind: CalendarKinds.Event,
        templateId: period.templateId,
        visibility: period.visibility,
        audienceTeamId: period.audienceTeamId,
        startsAt: slot,
        endsAt: new Date(slot.getTime() + step * 60_000),
        projectId: period.projectId,
        ownerId: period.ownerId,
      },
      select: { id: true },
    })
    created.push(row.id)
  }

  await prisma.calendarEvent.update({ where: { id: periodId }, data: { startsAt, endsAt } })

  return { created, removed }
}

/**
 * Keep the state of each annual reviews project in step with its interviews: under way once the first one started, done once the last one ended
 * @return {Promise<void>} - States settled
 */

export const syncAnnualProjectStates = async (): Promise<void> => {
  const projects = await prisma.project.findMany({
    where: { systemKey: { startsWith: PROJECT_KEY } },
    select: { id: true, stateId: true },
  })
  if (projects.length === 0) return

  const [doing, done, todo] = await Promise.all([
    prisma.workflowState.findFirst({
      where: { scope: WorkflowScopes.Project, phase: WorkflowPhases.Doing },
      orderBy: { position: 'asc' },
    }),
    prisma.workflowState.findFirst({
      where: { scope: WorkflowScopes.Project, phase: WorkflowPhases.Done },
      orderBy: { position: 'asc' },
    }),
    defaultState(WorkflowScopes.Project),
  ])
  const now = new Date()

  for (const project of projects) {
    const taken = await prisma.calendarEvent.aggregate({
      where: { projectId: project.id, kind: CalendarKinds.Event, accountId: { not: null } },
      _min: { startsAt: true },
      _max: { endsAt: true },
    })
    const first = taken._min.startsAt
    const last = taken._max.endsAt

    const stateId = !first || first > now ? todo : last && last <= now ? done?.id : doing?.id
    if (stateId && stateId !== project.stateId) {
      await prisma.project.update({ where: { id: project.id }, data: { stateId } })
    }
  }
}
