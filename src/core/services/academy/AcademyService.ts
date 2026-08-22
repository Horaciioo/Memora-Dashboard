import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import type { JuniorTraining, JuniorView } from '@/types/academy'
import { AcademyPeriods, MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Read every junior with their progression
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const listJuniors = async (): Promise<JuniorView[]> => {
  const [accounts, trainings] = await Promise.all([
    prisma.account.findMany({
      where: { status: MemberStatuses.Academy },
      include: {
        youtuber: true,
        primaryFunction: true,
        trainingRecords: { include: { validator: true } },
      },
      orderBy: [{ academyPeriod: 'asc' }, { joinedAt: 'asc' }],
    }),
    prisma.training.findMany({ orderBy: [{ period: 'asc' }, { position: 'asc' }] }),
  ])

  return accounts.map((account) => {
    const recordIndex = new Map(
      account.trainingRecords.map((record) => [record.trainingId, record])
    )

    // A junior only carries the trainings of their own period, plus the shared ones
    const scoped = trainings.filter(
      (training) => training.period === null || training.period === account.academyPeriod
    )

    const progression: JuniorTraining[] = scoped.map((training) => {
      const record = recordIndex.get(training.id)

      return {
        id: training.id,
        name: training.name,
        period: training.period,
        mandatory: training.mandatory,
        completedAt: record?.completedAt?.toISOString() ?? null,
        validatorName: record?.validator?.displayName ?? null,
      }
    })

    return {
      id: account.id,
      displayName: account.displayName,
      avatarUrl: account.avatarUrl,
      period: account.academyPeriod,
      youtuberName: account.youtuber?.name ?? null,
      functionName: account.primaryFunction?.name ?? null,
      joinedAt: account.joinedAt.toISOString(),
      trainings: progression,
      completedCount: progression.filter((training) => training.completedAt !== null).length,
      mandatoryPending: progression.filter(
        (training) => training.mandatory && training.completedAt === null
      ).length,
    }
  })
}

/**
 * Validate or revoke one training of a junior
 * @param {string} accountId - Account identifier
 * @param {string} trainingId - Training identifier
 * @param {boolean} validated - Wanted state
 * @param {string} validatorId - Who validated it
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const setTrainingRecord = async (
  accountId: string,
  trainingId: string,
  validated: boolean,
  validatorId: string
): Promise<JuniorView[]> => {
  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId } },
    update: {
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
    },
    create: {
      trainingId,
      accountId,
      completedAt: validated ? new Date() : null,
      validatorId: validated ? validatorId : null,
    },
  })

  return listJuniors()
}

/**
 * Move a junior to the next step of the academy
 * @param {string} accountId - Account identifier
 * @return {Promise<JuniorView[]>} - Juniors
 */

export const advanceJunior = async (accountId: string): Promise<JuniorView[]> => {
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  if (!account) throw notFound()

  // Discovery leads to practice, practice leads out of the academy
  if (account.academyPeriod === AcademyPeriods.Discovery) {
    await prisma.account.update({
      where: { id: accountId },
      data: { academyPeriod: AcademyPeriods.Practice },
    })
  } else {
    await prisma.account.update({
      where: { id: accountId },
      data: { academyPeriod: null, status: MemberStatuses.Active },
    })
  }

  return listJuniors()
}
