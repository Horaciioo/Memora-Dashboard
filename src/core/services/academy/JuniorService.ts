import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { resolveBoth } from '@/core/services/academy/phases'
import { toPerson } from '@/core/services/work/shared'
import { countCleared } from '@/core/lib/curriculum/progress'
import { courseByKey } from '@/declarations/academy/curriculum'
import type { JuniorTraining, JuniorView, SessionSummary } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import { AcademyJuniorStatuses, TrainingStatuses } from '@/utils/constants/hierarchy'
import type {
  AcademyStageName,
  AcademyJuniorStatusName,
  ReviewStatusName,
} from '@/utils/constants/hierarchy'
import { juniorInScope, sessionInScope, sessionTrainings } from '@/core/services/academy/lookups'
import { SESSION_SHAPE, sessionNumbers, toSummary } from '@/core/services/academy/sessionView'

/**
 * Shape one junior row with its progression
 * @param {object} row - Junior row
 * @param {object[]} trainings - Trainings of the programme
 * @return {JuniorView} - Junior view
 */

const toJunior = (
  row: {
    id: string
    sessionId: string
    accountId: string
    dispositifId: string | null
    confirmedAt: Date | null
    status: AcademyJuniorStatusName
    stage: AcademyStageName
    startedAt: Date
    validatedAt: Date | null
    liveCount: number
    bonusLives: number
    trainerId: string | null
    kickoffAt: Date | null
    deadlineAt: Date | null
    reviews: { stage: AcademyStageName; status: ReviewStatusName }[]
    session: { status: string; secondPeriodAt: Date | null }
    account: { displayName: string; avatarUrl: string | null }
    trainer: { id: string; displayName: string; avatarUrl: string | null } | null
    dispositif: { id: string; name: string; accent: string | null } | null
    _count: { reviews: number }
  },
  trainings: {
    id: string
    name: string
    period: JuniorTraining['period']
    mandatory: boolean
    curriculumKey: string | null
  }[],
  records: Map<
    string,
    { completedAt: Date | null; validator: { displayName: string } | null; progress: unknown }
  >
): JuniorView => {
  const progression: JuniorTraining[] = trainings.map((training) => {
    const record = records.get(training.id)
    const course = training.curriculumKey ? courseByKey(training.curriculumKey) : undefined

    return {
      id: training.id,
      name: training.name,
      period: training.period,
      mandatory: training.mandatory,
      completedAt: record?.completedAt?.toISOString() ?? null,
      validatorName: record?.validator?.displayName ?? null,
      exercises: course ? countCleared(course, record?.progress) : null,
    }
  })

  return {
    id: row.id,
    sessionId: row.sessionId,
    accountId: row.accountId,
    displayName: row.account.displayName,
    avatarUrl: row.account.avatarUrl,
    dispositif: row.dispositif,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    status: row.status,
    stage: row.stage,
    ...resolveBoth(row, row.session),
    trainer: toPerson(row.trainer),
    startedAt: row.startedAt.toISOString(),
    validatedAt: row.validatedAt?.toISOString() ?? null,
    liveCount: row.liveCount,
    bonusLives: row.bonusLives,
    trainings: progression,
    completedCount: progression.filter((training) => training.completedAt !== null).length,
    mandatoryPending: progression.filter(
      (training) => training.mandatory && training.completedAt === null
    ).length,
    reviewCount: row._count.reviews,
    values: {
      accountId: row.accountId,
      trainerId: row.trainerId,
      dispositifId: row.dispositifId,
      status: row.status,
      liveCount: row.liveCount,
      bonusLives: row.bonusLives,
    },
  }
}

// Everything a junior row needs to become a view
const JUNIOR_SHAPE = {
  account: { include: { trainingRecords: { include: { validator: true } } } },
  trainer: true,
  dispositif: true,
  reviews: { select: { stage: true, status: true } },
  session: { select: { status: true, secondPeriodAt: true } },
  _count: { select: { reviews: true } },
} as const

/**
 * Read every junior of a session
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorView[]>} - Juniors in reach
 */

export const listJuniors = async (
  sessionId: string,
  functionId: string,
  scope: AcademyScope
): Promise<JuniorView[]> => {
  const [rows, trainings] = await Promise.all([
    prisma.academyJunior.findMany({
      where: { sessionId, ...scope.juniors },
      include: JUNIOR_SHAPE,
      orderBy: [{ status: 'asc' }, { startedAt: 'asc' }],
    }),
    sessionTrainings(functionId),
  ])

  return rows.map((row) =>
    toJunior(
      row,
      // Each junior keeps only the trainings open to their own dispositif
      trainings.filter(
        (training) => training.dispositifId === null || training.dispositifId === row.dispositifId
      ),
      new Map(row.account.trainingRecords.map((record) => [record.trainingId, record]))
    )
  )
}

/**
 * Turn parsed values into a junior payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorData = (values: FormValues) => ({
  trainerId: readText(values, 'trainerId'),
  dispositifId: readText(values, 'dispositifId'),
})

/**
 * Take a moderator into a session
 * @param {string} sessionId - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const createJunior = async (
  sessionId: string,
  scope: AcademyScope,
  values: FormValues
): Promise<JuniorView[]> => {
  const session = await sessionInScope(sessionId, scope)

  await prisma.academyJunior.create({
    data: {
      sessionId,
      accountId: readText(values, 'accountId') ?? '',
      ...toJuniorData(values),
    },
  })

  return listJuniors(sessionId, session.functionId, scope)
}

/**
 * Read only what a self-read authorisation check needs
 * @param {string} id - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ accountId: string }>} - Owning account
 */

export const juniorAccount = async (
  id: string,
  scope: AcademyScope
): Promise<{ accountId: string }> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope.session, ...scope.juniors },
    select: { accountId: true },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Edit the follow-up of a junior
 * @param {string} id - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const updateJunior = async (
  id: string,
  scope: AcademyScope,
  values: FormValues
): Promise<JuniorView[]> => {
  const current = await juniorInScope(id, scope)

  // Status moves only when picked
  const status = readText(values, 'status') as AcademyJuniorStatusName | null
  const statusData =
    status && status !== current.status
      ? {
          status,
          validatedAt: status === AcademyJuniorStatuses.Validated ? new Date() : null,
        }
      : {}

  const row = await prisma.academyJunior.update({
    where: { id },
    data: { ...toJuniorData(values), ...statusData },
    include: { session: true },
  })

  return listJuniors(row.sessionId, row.session.functionId, scope)
}

/**
 * Take a junior out of a session
 * @param {string} id - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const removeJunior = async (id: string, scope: AcademyScope): Promise<JuniorView[]> => {
  await juniorInScope(id, scope)

  const row = await prisma.academyJunior.delete({ where: { id }, include: { session: true } })

  return listJuniors(row.sessionId, row.session.functionId, scope)
}

/**
 * Validate or revoke one training of a junior
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} trainingId - Training identifier
 * @param {boolean} validated - Wanted state
 * @param {string} validatorId - Who validated it
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const setTrainingRecord = async (
  juniorId: string,
  scope: AcademyScope,
  trainingId: string,
  validated: boolean,
  validatorId: string
): Promise<JuniorView[]> => {
  const junior = await juniorInScope(juniorId, scope)

  // A clearance moves the record to done
  const status = validated ? TrainingStatuses.Done : TrainingStatuses.InProgress

  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId: junior.accountId } },
    update: {
      status,
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
      juniorId,
    },
    create: {
      trainingId,
      accountId: junior.accountId,
      status,
      startedAt: new Date(),
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
      juniorId,
    },
  })

  return listJuniors(junior.sessionId, junior.session.functionId, scope)
}

/**
 * Read one junior on their own
 * @param {string} id - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ junior: JuniorView, session: SessionSummary }>} - Junior and its session
 */

export const readJunior = async (
  id: string,
  scope: AcademyScope
): Promise<{ junior: JuniorView; session: SessionSummary }> => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope.session, ...scope.juniors },
    include: { ...JUNIOR_SHAPE, session: { include: SESSION_SHAPE } },
  })

  if (!row) throw notFound()

  const trainings = await sessionTrainings(row.session.functionId, row.dispositifId)
  const records = new Map(row.account.trainingRecords.map((record) => [record.trainingId, record]))

  return {
    junior: toJunior(row, trainings, records),
    session: toSummary(await sessionNumbers(), row.session),
  }
}

/**
 * Resolve the FSI a signed-in junior acts on
 * @param {string} accountId - Signed-in member identifier
 * @return {Promise<{ id: string, sessionId: string, dispositifId: string, session: { functionId: string } } | null>} - Active FSI
 */

export const resolveOwnJunior = async (
  accountId: string
): Promise<{
  id: string
  sessionId: string
  dispositifId: string | null
  stage: AcademyStageName
  session: { functionId: string }
} | null> =>
  prisma.academyJunior.findFirst({
    where: { accountId, status: AcademyJuniorStatuses.Active },
    include: { session: { select: { functionId: true } } },
    orderBy: { startedAt: 'desc' },
  })

/**
 * Candidate file a junior came from
 * @param {string} id - Junior identifier
 * @return {Promise<{ id: string, sessionId: string } | null>} - Candidate, none when unlinked
 */

export const juniorCandidate = async (
  id: string
): Promise<{ id: string; sessionId: string } | null> => {
  const row = await prisma.academyJunior.findUnique({
    where: { id },
    select: { candidate: { select: { id: true, sessionId: true } } },
  })

  return row?.candidate ?? null
}
