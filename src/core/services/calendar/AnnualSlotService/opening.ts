import 'server-only'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput } from '@/core/lib/errors'
import { openDays, slotClocks } from '@/core/lib/calendar/annualSlots'
import { emojiOrRandom } from '@/core/lib/work'
import { openMeetingForEntry } from '@/core/services/work/MeetingService'
import { defaultState } from '@/core/services/work/shared'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import { ADMIN_ROLES, GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import {
  CalendarKinds,
  EventVisibilities,
  MeetingAudiences,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import { instantToWall, wallToInstant } from '@/utils/format/zone'
import { MINUTE_MS } from '@/utils/constants/time'
import {
  PROJECT_KEY,
  PROJECT_PLATFORM,
  PROJECT_PRIORITY,
  moderatorsOfTeam,
} from '@/core/services/calendar/AnnualSlotService/shared'
import type { OpenedSlots } from '@/core/services/calendar/AnnualSlotService/shared'

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
        endsAt: new Date(startsAt.getTime() + step * MINUTE_MS),
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
