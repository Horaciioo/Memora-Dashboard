import 'server-only'

import { prisma } from '@/core/lib/db'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { openSteps } from '@/core/services/academy/PimTimelineService'
import type { OpenStep } from '@/core/services/academy/PimTimelineService'
import { destinationHref, PIM_DESTINATION_REGISTRY } from '@/declarations/academy/guides'
import type { PimDestinationName } from '@/declarations/academy/guides'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { HomeTask } from '@/types/personal'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  StepOwners,
} from '@/utils/constants/hierarchy'
import type { StepOwnerName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Owners each seat acts for
const FORMATEUR_OWNERS: StepOwnerName[] = [StepOwners.Formateurs, StepOwners.Both]
const RESPONSABLE_OWNERS: StepOwnerName[] = [StepOwners.Responsable, StepOwners.Both]
const JUNIOR_OWNERS: StepOwnerName[] = [StepOwners.Junior]

/**
 * Turn a step in course into the task of whoever carries it
 * @param {OpenStep} open - Step in course
 * @return {HomeTask} - Task
 */

const stepTask = (open: OpenStep): HomeTask => {
  const destination = open.step.destination

  return {
    key: `step:${open.step.id}`,
    kind: 'pimStep',
    title: open.step.title,
    context: open.juniorName,
    icon: open.step.icon ?? 'clock',
    href: destination
      ? destinationHref(destination, { sessionId: open.sessionId, juniorId: open.juniorId })
      : ROUTES.junior(open.sessionId, open.juniorId),
    description: open.step.description,
    guide: open.step.guide,
    destinationLabel: destination ? PIM_DESTINATION_REGISTRY.label(destination) : null,
    dueAt: open.step.scheduledAt,
  }
}

/**
 * Build a task pointing at a declared destination
 * @param {Object} input - Task input
 * @param {string} input.key - Stable identifier
 * @param {HomeTask['kind']} input.kind - Where it comes from
 * @param {string} input.title - What to do
 * @param {string} input.context - Who or what it concerns
 * @param {PimDestinationName} input.destination - Where it gets done
 * @param {string} input.sessionId - Promotion
 * @param {string | null} input.juniorId - Junior, when one is concerned
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
 * Read the promotions a responsable still has to prepare: trainers to seat, then launch
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Preparation tasks
 */

const preparationTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const sessions = await prisma.academySession.findMany({
    where: {
      ...academyScope(viewer, access),
      status: { in: [AcademySessionStatuses.Draft, AcademySessionStatuses.Open] },
      juniors: { some: { confirmedAt: { not: null }, status: AcademyJuniorStatuses.Active } },
    },
    select: {
      id: true,
      summary: true,
      jobFunction: { select: { name: true } },
      juniors: {
        where: { confirmedAt: { not: null }, status: AcademyJuniorStatuses.Active },
        select: { id: true, trainerId: true, account: { select: { displayName: true } } },
      },
    },
  })

  return sessions.flatMap((session) => {
    const name = session.summary ?? session.jobFunction.name
    const orphans = session.juniors.filter((junior) => junior.trainerId === null)

    // Every confirmed junior needs a trainer before the promotion can start
    if (orphans.length > 0) {
      return orphans.map((junior) =>
        guidedTask({
          key: `trainer:${junior.id}`,
          kind: 'assignTrainer',
          title: PERSONAL_TASK_COPY.assignTrainer,
          context: `${junior.account.displayName} · ${name}`,
          destination: 'fsiTrainer',
          sessionId: session.id,
          juniorId: junior.id,
          description: PERSONAL_TASK_COPY.assignTrainerDescription,
        })
      )
    }

    return [
      guidedTask({
        key: `launch:${session.id}`,
        kind: 'launchPim',
        title: PERSONAL_TASK_COPY.launchPim,
        context: name,
        destination: 'sessionLaunch',
        sessionId: session.id,
        juniorId: null,
        description: PERSONAL_TASK_COPY.launchPimDescription,
      }),
    ]
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
 * Everything waiting on the signed-in member: steps they carry, promotions to prepare and
 * trainings to finish
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks, most pressing first
 */

export const myTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const manages = access.can(Permissions.AcademyManage)

  const [trained, managed, own, preparation, trainings] = await Promise.all([
    openSteps({ trainerId: viewer.id }),
    manages ? openSteps({ session: academyScope(viewer, access) }) : Promise.resolve([]),
    openSteps({ accountId: viewer.id }),
    manages ? preparationTasks(viewer, access) : Promise.resolve([]),
    trainingTasks(viewer.id),
  ])

  const carried = (steps: OpenStep[], owners: StepOwnerName[]) =>
    steps.filter((open) => open.step.owner !== null && owners.includes(open.step.owner))

  // A step shared by both seats shows once
  const seen = new Set<string>()
  const steps = [
    ...carried(trained, FORMATEUR_OWNERS),
    ...carried(managed, RESPONSABLE_OWNERS),
    ...carried(own, JUNIOR_OWNERS),
  ]
    .filter((open) => !seen.has(open.step.id) && seen.add(open.step.id))
    .sort((left, right) =>
      (left.step.scheduledAt ?? '').localeCompare(right.step.scheduledAt ?? '')
    )
    .map(stepTask)

  return [...preparation, ...steps, ...trainings]
}
