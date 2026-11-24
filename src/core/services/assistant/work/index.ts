import 'server-only'

import { resolveReference } from '@/core/lib/assistant/context'
import { lookupName } from '@/core/lib/assistant/matching'
import { askChoice, fill, missing, speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { listReviewQueue } from '@/core/services/absences/AbsenceService'
import { listRequests } from '@/core/services/unban/UnbanRequestService'
import { listAnnouncements } from '@/core/services/work/AnnouncementService'
import { listMeetings } from '@/core/services/work/MeetingService'
import { listProjects } from '@/core/services/work/ProjectService'
import { workViewer } from '@/core/services/work/visibility'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { WORK_COPY } from '@/declarations/assistant/variants/work'
import { ROUTES } from '@/declarations/navigation'
import type { AssistantSayLine } from '@/types/assistant'
import { DAY_MS } from '@/utils/constants/time'
import { UnbanStatuses } from '@/utils/constants/unban'
import { formatWeekday, formatWeekdayTime } from '@/utils/format/time/dates'

// What a list says at most, the rest is counted
const cap = () => ASSISTANT_SETTINGS.pointLines

/**
 * Meeting of the member that comes next
 * @type {Resolver}
 */

export const resolveNextMeeting: Resolver = async ({ session, access, scope, parsed }) => {
  const meetings = await listMeetings(await scope(), workViewer(session, access))
  const now = Date.now()
  const next = meetings
    .filter(
      (meeting) =>
        meeting.scheduledAt &&
        new Date(meeting.scheduledAt).getTime() >= now &&
        [...meeting.leads, ...meeting.assistants, ...meeting.participants].some(
          (person) => person.id === session.id
        )
    )
    .sort((left, right) => left.scheduledAt!.localeCompare(right.scheduledAt!))[0]

  return speak({
    intent: parsed.intent,
    lines: [
      next
        ? {
            text: fill(WORK_COPY.nextMeeting, {
              title: next.title,
              when: formatWeekdayTime(next.scheduledAt),
            }),
            link: { href: ROUTES.meeting(next.id), label: next.title },
          }
        : {
            text: WORK_COPY.noMeeting,
            link: { href: ROUTES.meetings, label: WORK_COPY.openMeetings },
          },
    ],
  })
}

/**
 * Projects past their deadline
 * @type {Resolver}
 */

export const resolveLateProjects: Resolver = async ({ session, access, scope, parsed }) => {
  const late = (await listProjects(await scope(), workViewer(session, access))).filter(
    (project) => project.isOverdue
  )
  if (late.length === 0) {
    return speak({ intent: parsed.intent, lines: [{ text: WORK_COPY.noLateProject }] })
  }

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text:
          late.length === 1
            ? WORK_COPY.lateProjectOne
            : fill(WORK_COPY.lateProjects, { count: String(late.length) }),
      },
      ...late.slice(0, cap()).map((project): AssistantSayLine => ({
        text: fill(WORK_COPY.lateProject, {
          title: project.title,
          when: project.deadline ? formatWeekday(project.deadline) : '',
        }),
        link: { href: ROUTES.project(project.id), label: project.title },
      })),
    ],
  })
}

/**
 * Where a project stands: state, leads, load and deadline
 * @type {Resolver}
 */

export const resolveProjectPoint: Resolver = async (context) => {
  const { session, access, scope, parsed, request, page } = context
  const projects = await listProjects(await scope(), workViewer(session, access))
  const options = projects.map((project) => ({ value: project.id, label: project.title }))

  const known = request.filled.project ?? resolveReference('project', page, request.memory)
  const found = parsed.subject
    ? lookupName(parsed.subject, options, ASSISTANT_SETTINGS.maxChoices)
    : known && options.some((option) => option.value === known)
      ? ({ kind: 'one', match: options.find((option) => option.value === known)! } as const)
      : ({ kind: 'none' } as const)

  if (found.kind === 'none') {
    return parsed.subject
      ? missing(parsed.intent!, parsed.subject)
      : speak({ intent: parsed.intent, lines: [{ text: WORK_COPY.noProject }] })
  }

  if (found.kind === 'many') {
    return askChoice({
      intent: parsed.intent!,
      slotKey: 'project',
      reply: fill(ASSISTANT_COPY.pickOne, { name: parsed.subject }),
      choices: found.matches,
    })
  }

  const project = projects.find((entry) => entry.id === found.match.value)!
  const leads = project.leads.map((person) => person.name)

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text: project.state
          ? fill(WORK_COPY.projectState, { title: project.title, state: project.state.label })
          : fill(WORK_COPY.projectStateNone, { title: project.title }),
        link: { href: ROUTES.project(project.id), label: project.title },
      },
      ...(leads.length > 0
        ? [{ text: fill(WORK_COPY.projectLeads, { names: leads.join(WORK_COPY.namesJoin) }) }]
        : []),
      {
        text: fill(WORK_COPY.projectLoad, {
          tasks: String(project.taskCount),
          meetings: String(project.meetingCount),
        }),
      },
      ...(project.deadline
        ? [
            {
              text: fill(project.isOverdue ? WORK_COPY.projectLate : WORK_COPY.projectDeadline, {
                when: formatWeekday(project.deadline),
              }),
            },
          ]
        : []),
    ],
  })
}

// Days an announcement stays « of the week »
const WEEK_DAYS = 7

/**
 * Announcements of the last seven days
 * @type {Resolver}
 */

export const resolveAnnouncements: Resolver = async ({ session, access, scope, parsed }) => {
  const since = Date.now() - WEEK_DAYS * DAY_MS
  const rows = (await listAnnouncements(workViewer(session, access), access, await scope()))
    .filter((row) => new Date(row.at).getTime() >= since)
    .sort((left, right) => right.at.localeCompare(left.at))

  if (rows.length === 0) {
    return speak({ intent: parsed.intent, lines: [{ text: WORK_COPY.noAnnouncement }] })
  }

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text:
          rows.length === 1
            ? WORK_COPY.announcementOne
            : fill(WORK_COPY.announcements, { count: String(rows.length) }),
      },
      ...rows.slice(0, cap()).map((row): AssistantSayLine => ({
        text: fill(WORK_COPY.announcement, { title: row.title, origin: row.origin }),
        ...(row.href && { link: { href: row.href, label: row.title } }),
      })),
    ],
  })
}

/**
 * Absences waiting for the member's answer
 * @type {Resolver}
 */

export const resolvePendingAbsences: Resolver = async ({ session, access, parsed }) => {
  const queue = await listReviewQueue(session.id, access.isAdmin)
  if (queue.length === 0) {
    return speak({ intent: parsed.intent, lines: [{ text: WORK_COPY.noPendingAbsence }] })
  }

  const names = queue
    .slice(0, cap())
    .map((absence) => absence.memberName)
    .join(WORK_COPY.namesJoin)

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text: fill(queue.length === 1 ? WORK_COPY.pendingAbsenceOne : WORK_COPY.pendingAbsences, {
          count: String(queue.length),
          names,
        }),
        link: { href: ROUTES.absences, label: WORK_COPY.openAbsences },
      },
    ],
    replies: queue.length > 0 ? [WORK_COPY.approveAll] : [],
  })
}

/**
 * Deban. requests nobody has taken
 * @type {Resolver}
 */

export const resolvePendingUnban: Resolver = async ({ session, access, scope, parsed }) => {
  const { items, nextCursor } = await listRequests(
    { statuses: [UnbanStatuses.Pending], assignee: 'none', limit: cap() },
    { access, scope: await scope(), actorId: session.id }
  )
  if (items.length === 0) {
    return speak({ intent: parsed.intent, lines: [{ text: WORK_COPY.noPendingUnban }] })
  }

  const head = nextCursor
    ? fill(WORK_COPY.pendingUnbanMore, { count: String(items.length) })
    : items.length === 1
      ? WORK_COPY.pendingUnbanOne
      : fill(WORK_COPY.pendingUnban, { count: String(items.length) })

  return speak({
    intent: parsed.intent,
    lines: [
      { text: head, link: { href: ROUTES.unban, label: WORK_COPY.openUnban } },
      ...items.map((item): AssistantSayLine => ({
        text: fill(WORK_COPY.unbanLine, { name: item.discordName, creator: item.youtuberName }),
        link: { href: ROUTES.unbanRequest(item.id), label: item.reference },
      })),
    ],
  })
}
