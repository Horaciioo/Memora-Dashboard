import 'server-only'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { parkourStandings } from '@/core/services/academy/parkour/ParkourService'
import { REVIEW_DUE_PHASES, reviewStageOf } from '@/core/lib/academy/parkour'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import type { IconName } from '@/declarations/ui/icons'
import type { HomeTask } from '@/types/personal'
import { AcademyStages } from '@/utils/constants/hierarchy'
import { fileTab } from '@/core/services/personal/TaskInboxService/shared'

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

export const parkourTask = ({
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
 * Read the check-ins a referent owes
 * @param {string} referentId - Signed-in referent
 * @return {Promise<HomeTask[]>} - Review tasks
 */

export const reviewTasks = async (referentId: string): Promise<HomeTask[]> => {
  const standings = await parkourStandings({ referentId })

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

export const trainingTasks = async (accountId: string): Promise<HomeTask[]> => {
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
