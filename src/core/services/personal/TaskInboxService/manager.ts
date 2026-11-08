import 'server-only'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { openDepartures, parkourStandings } from '@/core/services/academy/parkour/ParkourService'
import { DECISION_PHASES } from '@/core/lib/academy/parkour'
import { DEPARTURE_COPY, PARKOUR_NAME } from '@/declarations/academy/parkour'
import { ROUTES } from '@/declarations/navigation'
import { isReviewMissing } from '@/core/lib/recruitment/review'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { HomeTask } from '@/types/personal'
import { Permissions } from '@/utils/constants/permissions'
import { unreadReports } from '@/core/services/system/NotificationService'
import { prisma } from '@/core/lib/db'
import { readScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { fileTab, guidedTask } from '@/core/services/personal/TaskInboxService/shared'
import { parkourTask } from '@/core/services/personal/TaskInboxService/academy'

/**
 * Read what the PIM journey waits on from a responsable: referents, PIM starts, launches,
 * decisions and the second period
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks
 */

export const managerTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const scope = academyScope(viewer, access)
  const standings = await parkourStandings({ session: scope.session, ...scope.juniors })
  const tasks: HomeTask[] = []

  for (const standing of standings) {
    const context = `${standing.name}, ${standing.sessionName}`

    if (standing.phase === 'needsReferent') {
      tasks.push(
        guidedTask({
          key: `referent:${standing.juniorId}`,
          kind: 'assignReferent',
          title: PERSONAL_TASK_COPY.assignReferent,
          context,
          destination: 'fsiReferent',
          sessionId: standing.sessionId,
          juniorId: standing.juniorId,
          description: PERSONAL_TASK_COPY.assignReferentDescription,
        })
      )
    }

    if (DECISION_PHASES.includes(standing.phase)) {
      tasks.push(
        parkourTask({
          key: `decision:${standing.juniorId}`,
          kind: 'pimDecision',
          title: PERSONAL_TASK_COPY.decision
            .replace('{referent}', standing.referentName ?? '')
            .replace('{junior}', standing.name),
          context: standing.sessionName,
          icon: 'sheet',
          href: fileTab(standing, 'reviews'),
          description: PERSONAL_TASK_COPY.decisionDescription,
        })
      )
    }
  }

  // One launch per promotion where some are ready and the others still on their form
  const sessions = new Set(standings.map((standing) => standing.sessionId))
  for (const sessionId of sessions) {
    const seats = standings.filter((standing) => standing.sessionId === sessionId)
    const first = seats[0]
    if (!first) continue

    if (!first.sessionRunning && seats.some((seat) => seat.phase === 'ready')) {
      tasks.push(
        guidedTask({
          key: `launch:${sessionId}`,
          kind: 'launchPim',
          title: PERSONAL_TASK_COPY.launchPim,
          context: first.sessionName,
          destination: 'sessionLaunch',
          sessionId,
          juniorId: null,
          description: PERSONAL_TASK_COPY.launchPimDescription,
        })
      )
    }

    const waiting = seats.find((seat) => seat.phase === 'periodOneDone')
    if (first.sessionRunning && waiting) {
      tasks.push(
        parkourTask({
          key: `second:${sessionId}`,
          kind: 'secondPeriod',
          title: PERSONAL_TASK_COPY.secondPeriod,
          context: first.sessionName,
          icon: 'climb',
          href: ROUTES.junior(sessionId, waiting.juniorId),
          description: PERSONAL_TASK_COPY.secondPeriodDescription,
        })
      )
    }
  }

  // Departures to announce
  const departures = await openDepartures()
  for (const departure of departures) {
    tasks.push({
      ...parkourTask({
        key: `departure:${departure.id}`,
        kind: 'departure',
        title: DEPARTURE_COPY.task.replace('{name}', departure.name),
        context: PARKOUR_NAME,
        icon: 'mail',
        href: ROUTES.home,
        description: DEPARTURE_COPY.description,
      }),
      announcement: { id: departure.id, body: departure.body },
    })
  }

  return tasks
}

/**
 * Candidates the member interviewed and still owes a bilan for
 * @param {string} accountId - Recruiter
 * @return {Promise<HomeTask[]>} - One task per bilan missing
 */

export const candidateReviewTasks = async (accountId: string): Promise<HomeTask[]> => {
  // One read for every candidate of the recruiter
  const rows = await prisma.recruitmentCandidate.findMany({
    where: { verdictAt: { not: null }, recruiters: { some: { accountId } } },
    select: {
      id: true,
      sessionId: true,
      discordId: true,
      displayName: true,
      review: true,
      verdictAt: true,
    },
    orderBy: { verdictAt: 'asc' },
  })
  const missing = rows.filter(isReviewMissing)
  if (missing.length === 0) return []

  const members = await prisma.account.findMany({
    where: { discordId: { in: missing.map((row) => row.discordId) } },
    select: { discordId: true, displayName: true },
  })
  const names = new Map(members.map((member) => [member.discordId, member.displayName]))

  return missing.map((row) => ({
    key: `candidateReview:${row.id}`,
    kind: 'candidateReview' as const,
    title: PERSONAL_TASK_COPY.candidateReviewTitle.replace(
      '{name}',
      names.get(row.discordId) ?? row.displayName ?? row.discordId
    ),
    context: '',
    icon: 'note' as const,
    href: ROUTES.candidateBilan(row.sessionId, row.id),
    description: PERSONAL_TASK_COPY.candidateReviewDescription,
    guide: null,
    destinationLabel: null,
    dueAt: null,
  }))
}

/**
 * Reports of lives the member missed, until they open them
 * @param {string} accountId - Member
 * @return {Promise<HomeTask[]>} - One task per report not seen
 */

export const reportTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  // A report only leads where the viewer may open it, and parents are not inherited
  if (!access.canAll([Permissions.LiveRead, Permissions.LiveLogRead])) return []

  const unread = (await unreadReports(viewer.id)).filter((report) => report.targetId)
  if (unread.length === 0) return []

  // A live dropped or out of perimeter has no page to land on
  const reachable = await prisma.live.findMany({
    where: scopedWhere('live', await readScope(viewer, access), {
      id: { in: unread.map((report) => report.targetId as string) },
    }),
    select: { id: true },
  })
  const reachableIds = new Set(reachable.map((live) => live.id))

  // One card per live
  const reports = [...new Map(unread.map((report) => [report.targetId, report])).values()].filter(
    (report) => reachableIds.has(report.targetId as string)
  )
  if (reports.length === 0) return []
  const accountId = viewer.id

  // Whoever was in the Mod View already saw how it went
  const joined = await prisma.modViewPresence.findMany({
    where: { accountId, liveId: { in: reports.map((report) => report.targetId as string) } },
    select: { liveId: true },
    distinct: ['liveId'],
  })
  const present = new Set(joined.map((row) => row.liveId))

  return reports
    .filter((report) => !present.has(report.targetId as string))
    .map((report) => ({
      key: `report:${report.targetId}`,
      kind: 'liveReport' as const,
      title: PERSONAL_TASK_COPY.liveReportTitle.replace('{title}', report.subject ?? ''),
      context: '',
      icon: 'modActions' as const,
      href: ROUTES.liveReport(report.targetId as string),
      description: PERSONAL_TASK_COPY.liveReportDescription,
      guide: null,
      destinationLabel: null,
      dueAt: null,
    }))
}
