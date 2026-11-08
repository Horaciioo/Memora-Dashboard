import 'server-only'
import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { openDays, slotClocks } from '@/core/lib/calendar/annualSlots'
import { notify } from '@/core/services/system/NotificationService'
import { defaultState } from '@/core/services/work/shared'
import { ANNUAL_REVIEW_COPY } from '@/declarations/calendar/copy'
import { ROUTES } from '@/declarations/navigation'
import { GONE_MEMBER_STATUSES, MemberRoles } from '@/utils/constants/hierarchy'
import {
  AttendanceStatuses,
  CalendarKinds,
  WorkflowPhases,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import { wallToInstant } from '@/utils/format/zone'
import { DAY_MS, MINUTE_MS } from '@/utils/constants/time'
import { PROJECT_KEY } from '@/core/services/calendar/AnnualSlotService/shared'

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
    if (now < new Date(last.getTime() - REMINDER_DAYS * DAY_MS) || now >= last) continue

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
        endsAt: new Date(slot.getTime() + step * MINUTE_MS),
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
