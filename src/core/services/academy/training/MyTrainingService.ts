import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { JuniorTraining, MyTrainingAction, MyTrainingView } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'
import type { TrainingStatusName } from '@/utils/constants/hierarchy'
import { resolveOwnJunior } from '@/core/services/academy/juniors/JuniorService'
import { sessionTrainings } from '@/core/services/academy/lookups'

/**
 * Shape one training on a junior's own progression page
 * @param {object} training - Training row
 * @param {object} [record] - Existing attendance
 * @return {MyTrainingView} - Training view
 */

const toMyTraining = (
  training: {
    id: string
    name: string
    summary: string | null
    period: JuniorTraining['period']
    mandatory: boolean
  },
  record?: {
    status: TrainingStatusName
    attempts: number
    startedAt: Date | null
    completedAt: Date | null
    abandonedAt: Date | null
  }
): MyTrainingView => ({
  id: training.id,
  name: training.name,
  summary: training.summary,
  period: training.period,
  mandatory: training.mandatory,
  status: record?.status ?? TrainingStatuses.NotStarted,
  attempts: record?.attempts ?? 0,
  startedAt: record?.startedAt?.toISOString() ?? null,
  completedAt: record?.completedAt?.toISOString() ?? null,
  abandonedAt: record?.abandonedAt?.toISOString() ?? null,
})

/**
 * Read the trainings open to a junior's own function and dispositif
 * @param {string} accountId - Signed-in member identifier
 * @param {string} functionId - Function identifier
 * @param {string | null} dispositifId - Dispositif identifier
 * @return {Promise<MyTrainingView[]>} - Trainings in display order
 */

export const myTrainings = async (
  accountId: string,
  functionId: string,
  dispositifId: string | null
): Promise<MyTrainingView[]> => {
  const [trainings, records] = await Promise.all([
    sessionTrainings(functionId, dispositifId),
    prisma.trainingRecord.findMany({ where: { accountId } }),
  ])

  const recordByTraining = new Map(records.map((record) => [record.trainingId, record]))

  return trainings.map((training) => toMyTraining(training, recordByTraining.get(training.id)))
}

/**
 * Move a junior's own attendance on one training
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @param {string} juniorId - FSI the move is stamped with
 * @param {MyTrainingAction} action - Move applied
 * @return {Promise<{ view: MyTrainingView, completed: boolean }>} - Updated training
 */

const applyMyTraining = async (
  trainingId: string,
  accountId: string,
  juniorId: string,
  action: MyTrainingAction
): Promise<{ view: MyTrainingView; completed: boolean }> => {
  const existing = await prisma.trainingRecord.findUnique({
    where: { trainingId_accountId: { trainingId, accountId } },
  })

  const data =
    action === 'start'
      ? { status: TrainingStatuses.InProgress, startedAt: new Date(), juniorId }
      : action === 'resume'
        ? { status: TrainingStatuses.InProgress, abandonedAt: null, juniorId }
        : action === 'restart'
          ? {
              status: TrainingStatuses.InProgress,
              attempts: (existing?.attempts ?? 0) + 1,
              startedAt: new Date(),
              completedAt: null,
              abandonedAt: null,
              juniorId,
            }
          : action === 'abandon'
            ? { status: TrainingStatuses.Abandoned, abandonedAt: new Date() }
            : { status: TrainingStatuses.Done, completedAt: new Date() }

  const row = await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId } },
    update: data,
    create: { trainingId, accountId, startedAt: new Date(), ...data },
  })

  const training = await prisma.training.findUniqueOrThrow({ where: { id: trainingId } })

  return { view: toMyTraining(training, row), completed: action === 'complete' }
}

/**
 * Move a junior's own attendance on one training
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @param {MyTrainingAction} action - Move applied
 * @return {Promise<MyTrainingView[]>} - Trainings open to the junior
 */

export const setMyTraining = async (
  trainingId: string,
  accountId: string,
  action: MyTrainingAction
): Promise<MyTrainingView[]> => {
  const junior = await resolveOwnJunior(accountId)
  if (!junior) throw notFound()

  const open = await sessionTrainings(junior.session.functionId, junior.dispositifId)
  if (!open.some((training) => training.id === trainingId)) throw notFound()

  await applyMyTraining(trainingId, accountId, junior.id, action)

  return myTrainings(accountId, junior.session.functionId, junior.dispositifId)
}
