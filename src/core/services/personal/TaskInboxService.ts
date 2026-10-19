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
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { IconName } from '@/declarations/ui/icons'
import type { HomeTask } from '@/types/personal'
import { AcademyStages } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import { unreadMentions, unreadReports } from '@/core/services/system/NotificationService'
import { prisma } from '@/core/lib/db'

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

const reportTasks = async (accountId: string): Promise<HomeTask[]> => {
  const reports = (await unreadReports(accountId)).filter((report) => report.targetId)
  if (reports.length === 0) return []

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
 * Everything waiting on the signed-in member: what the parkour asks of their seat
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks
 */

export const myTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const [preparation, reviews, trainings, mentions, reports] = await Promise.all([
    access.can(Permissions.AcademyManage) ? managerTasks(viewer, access) : Promise.resolve([]),
    reviewTasks(viewer.id),
    trainingTasks(viewer.id),
    mentionTasks(viewer.id),
    reportTasks(viewer.id),
  ])

  return [...mentions, ...reports, ...preparation, ...reviews, ...trainings]
}
