import 'server-only'

import { academyScope } from '@/core/services/academy/AcademyScope'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { openDepartures, parkourStandings } from '@/core/services/academy/parkour/ParkourService'
import type { ParkourStanding } from '@/core/services/academy/parkour/ParkourService'
import { DECISION_PHASES, REVIEW_DUE_PHASES, reviewStageOf } from '@/core/lib/academy/parkour'
import { DEPARTURE_COPY, PARKOUR_NAME } from '@/declarations/academy/parkour'
import {
  destinationHref,
  GUIDE_PARAMS,
  PIM_DESTINATION_REGISTRY,
} from '@/declarations/academy/guides'
import type { PimDestinationName } from '@/declarations/academy/guides'
import { ROUTES } from '@/declarations/navigation'
import { isReviewMissing } from '@/core/lib/recruitment/review'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { IconName } from '@/declarations/ui/icons'
import type { HomeTask } from '@/types/personal'
import { AcademyStages } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import { unreadMentions, unreadReports } from '@/core/services/system/NotificationService'
import { prisma } from '@/core/lib/db'
import { readScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { syncSystemTasks } from '@/core/services/personal/SystemTaskService'
import { WorkflowPhases } from '@/utils/constants/workflow'
import { PlayGames } from '@/utils/constants/play'

/**
 * Build a task pointing at a declared destination
 * @param {Object} input - Task input
 * @param {string} input.key - Stable identifier
 * @param {HomeTask['kind']} input.kind - Where it comes from
 * @param {string} input.title - What to do
 * @param {string} input.context - Who or what it concerns
 * @param {PimDestinationName} input.destination - Where it gets done
 * @param {string} input.sessionId - Promotion
 * @param {string | null} input.juniorId - Junior
 * @param {string} input.description - What must happen
 * @return {HomeTask} - Task
 */

const guidedTask = ({
  key,
  kind,
  title,
  context,
  destination,
  sessionId,
  juniorId,
  description,
}: {
  key: string
  kind: HomeTask['kind']
  title: string
  context: string
  destination: PimDestinationName
  sessionId: string
  juniorId: string | null
  description: string
}): HomeTask => ({
  key,
  kind,
  title,
  context,
  icon: PIM_DESTINATION_REGISTRY.get(destination).icon,
  href: destinationHref(destination, { sessionId, juniorId }),
  description,
  guide: null,
  destinationLabel: PIM_DESTINATION_REGISTRY.label(destination),
  dueAt: null,
})

/**
 * Link to one tab of a junior's file
 * @param {ParkourStanding} standing - Junior
 * @param {string} tab - File tab
 * @return {string} - Address
 */

const fileTab = (standing: ParkourStanding, tab: string): string =>
  `${ROUTES.junior(standing.sessionId, standing.juniorId)}?${new URLSearchParams({
    [GUIDE_PARAMS.tab]: tab,
  })}`

/**
 * Build a parkour task on a junior's file
 * @param {Object} input - Task input
 * @param {string} input.key - Stable identifier
 * @param {HomeTask['kind']} input.kind - Where it comes from
 * @param {string} input.title - What to do
 * @param {string} input.context - Who it concerns
 * @param {IconName} input.icon - Glyph
 * @param {string} input.href - Where it gets done
 * @param {string} input.description - What must happen
 * @return {HomeTask} - Task
 */

const parkourTask = ({
  key,
  kind,
  title,
  context,
  icon,
  href,
  description,
}: {
  key: string
  kind: HomeTask['kind']
  title: string
  context: string
  icon: IconName
  href: string
  description: string
}): HomeTask => ({
  key,
  kind,
  title,
  context,
  icon,
  href,
  description,
  guide: null,
  destinationLabel: null,
  dueAt: null,
})

/**
 * Read what the PIM journey waits on from a responsable: trainers, PIM starts, launches,
 * decisions and the second period
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks
 */

const managerTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const scope = academyScope(viewer, access)
  const standings = await parkourStandings({ session: scope.session, ...scope.juniors })
  const tasks: HomeTask[] = []

  for (const standing of standings) {
    const context = `${standing.name}, ${standing.sessionName}`

    if (standing.phase === 'needsTrainer') {
      tasks.push(
        guidedTask({
          key: `trainer:${standing.juniorId}`,
          kind: 'assignTrainer',
          title: PERSONAL_TASK_COPY.assignTrainer,
          context,
          destination: 'fsiTrainer',
          sessionId: standing.sessionId,
          juniorId: standing.juniorId,
          description: PERSONAL_TASK_COPY.assignTrainerDescription,
        })
      )
    }

    if (standing.phase === 'needsKickoff') {
      tasks.push(
        parkourTask({
          key: `kickoff:${standing.juniorId}`,
          kind: 'declareKickoff',
          title: PERSONAL_TASK_COPY.declareKickoff,
          context,
          icon: 'link',
          href: ROUTES.junior(standing.sessionId, standing.juniorId),
          description: PERSONAL_TASK_COPY.declareKickoffDescription,
        })
      )
    }

    if (DECISION_PHASES.includes(standing.phase)) {
      tasks.push(
        parkourTask({
          key: `decision:${standing.juniorId}`,
          kind: 'pimDecision',
          title: PERSONAL_TASK_COPY.decision
            .replace('{trainer}', standing.trainerName ?? '')
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
 * Read the check-ins a trainer owes
 * @param {string} trainerId - Signed-in trainer
 * @return {Promise<HomeTask[]>} - Review tasks
 */

const reviewTasks = async (trainerId: string): Promise<HomeTask[]> => {
  const standings = await parkourStandings({ trainerId })

  return standings
    .filter((standing) => REVIEW_DUE_PHASES.includes(standing.phase))
    .map((standing) => {
      const stage = reviewStageOf(standing.stage) ?? AcademyStages.ReviewOne

      return parkourTask({
        key: `review:${standing.juniorId}:${stage}`,
        kind: 'pimReview',
        title:
          PERSONAL_TASK_COPY.reviewDue[stage as keyof typeof PERSONAL_TASK_COPY.reviewDue] ??
          PERSONAL_TASK_COPY.reviewDue.REVIEW_ONE,
        context: `${standing.name}, ${standing.sessionName}`,
        icon: 'sheet',
        href: fileTab(standing, 'reviews'),
        description: PERSONAL_TASK_COPY.reviewDueDescription,
      })
    })
}

/**
 * Read the mandatory trainings a junior still has to finish
 * @param {string} accountId - Signed-in junior
 * @return {Promise<HomeTask[]>} - Training tasks
 */

const trainingTasks = async (accountId: string): Promise<HomeTask[]> => {
  const junior = await resolveOwnJunior(accountId)
  if (!junior) return []

  const trainings = await myTrainings(accountId, junior.session.functionId, junior.dispositifId)

  return trainings
    .filter((training) => training.mandatory && training.completedAt === null)
    .map((training) => ({
      key: `training:${training.id}`,
      kind: 'training',
      title: training.name,
      context: PERSONAL_TASK_COPY.trainingContext,
      icon: 'academy',
      href: ROUTES.training(training.id),
      description: training.summary,
      guide: null,
      destinationLabel: null,
      dueAt: null,
    }))
}

/**
 * Candidates the member interviewed and still owes a bilan for
 * @param {string} accountId - Recruiter
 * @return {Promise<HomeTask[]>} - One task per bilan missing
 */

const candidateReviewTasks = async (accountId: string): Promise<HomeTask[]> => {
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
 * Comments of a recruitment session that named the member
 * @param {string} accountId - Member
 * @return {Promise<HomeTask[]>} - One task per unseen mention
 */

const mentionTasks = async (accountId: string): Promise<HomeTask[]> => {
  const mentions = await unreadMentions(accountId, 'recruitment')

  return mentions.flatMap((mention) =>
    mention.targetId
      ? [
          {
            key: `mention:${mention.id}`,
            kind: 'mention' as const,
            title: PERSONAL_TASK_COPY.mentionTitle.replace(
              '{name}',
              mention.actorName ?? PERSONAL_TASK_COPY.mentionSomeone
            ),
            context: mention.subject ?? '',
            icon: 'note' as const,
            href: ROUTES.recruitment(mention.targetId),
            description: PERSONAL_TASK_COPY.mentionDescription,
            guide: null,
            destinationLabel: null,
            dueAt: null,
          },
        ]
      : []
  )
}

/**
 * Reports of lives the member missed, until they open them
 * @param {string} accountId - Member
 * @return {Promise<HomeTask[]>} - One task per report not seen
 */

const reportTasks = async (viewer: SessionUser, access: PermissionHelpers): Promise<HomeTask[]> => {
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

/**
 * First Baccalaureat game, until one is played
 * @param {string} accountId - Member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - The task, or none
 */

const playTasks = async (accountId: string, access: PermissionHelpers): Promise<HomeTask[]> => {
  if (!access.can(Permissions.PlayAccess)) return []
  const played = await prisma.playGameStat.count({
    where: { accountId, game: PlayGames.Baccalaureat, played: { gt: 0 } },
  })
  if (played) return []

  return [
    {
      key: 'play:first-baccalaureat',
      kind: 'play',
      title: PERSONAL_TASK_COPY.firstGameTitle,
      context: '',
      icon: 'play',
      href: ROUTES.play,
      description: PERSONAL_TASK_COPY.firstGameDescription,
      guide: null,
      destinationLabel: null,
      dueAt: null,
    },
  ]
}

/**
 * Tasks of the task board held by the member, the ones the system opens excluded
 * @param {string} accountId - Owner
 * @return {Promise<HomeTask[]>} - One task per card still to do
 */

const boardTasks = async (accountId: string): Promise<HomeTask[]> => {
  const rows = await prisma.task.findMany({
    where: {
      ownerId: accountId,
      // The ones mirroring the timeline already show through it
      NOT: { systemKey: { startsWith: `${accountId}:` } },
      archived: false,
      OR: [{ stateId: null }, { state: { phase: { not: WorkflowPhases.Done } } }],
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      project: { select: { title: true } },
    },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })

  return rows.map((row) => ({
    key: `task:${row.id}`,
    kind: 'task' as const,
    title: row.title,
    context: row.project?.title ?? '',
    icon: 'tasks' as const,
    href: ROUTES.task(row.id),
    description: row.description,
    guide: null,
    destinationLabel: null,
    dueAt: row.dueDate?.toISOString() ?? null,
  }))
}

/**
 * Everything waiting on the signed-in member: what the parkour asks of their seat
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks
 */

export const myTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const [preparation, reviews, trainings, interviews, mentions, reports, play] = await Promise.all([
    access.can(Permissions.AcademyManage) ? managerTasks(viewer, access) : Promise.resolve([]),
    reviewTasks(viewer.id),
    trainingTasks(viewer.id),
    candidateReviewTasks(viewer.id),
    mentionTasks(viewer.id),
    reportTasks(viewer, access),
    playTasks(viewer.id, access),
  ])

  const timeline = [...preparation, ...reviews, ...trainings, ...interviews]
  if (!access.can(Permissions.TaskRead)) return [...mentions, ...reports, ...timeline, ...play]

  // The timeline opens its tasks on the board, ticking one there takes it off the home
  const [done, board] = await Promise.all([
    syncSystemTasks(viewer.id, timeline),
    boardTasks(viewer.id),
  ])

  return [
    ...mentions,
    ...reports,
    ...timeline.filter((task) => !done.has(task.key)),
    ...board,
    ...play,
  ]
}
