import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { notFound } from '@/core/lib/errors'
import { courseByKey } from '@/declarations/academy/curriculum'
import { tradeOfFunction } from '@/declarations/reference/fixed'

/**
 * Load a session inside scope or fail
 * @param {string} id - Session identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ id: string, functionId: string }>} - Session row
 */

export const sessionInScope = async (id: string, scope: AcademyScope) => {
  const row = await prisma.academySession.findFirst({
    where: { id, ...scope.session },
    include: { jobFunction: { select: { name: true } } },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Load a junior inside scope or fail
 * @param {string} id - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ id: string, sessionId: string, accountId: string, session: { functionId: string } }>} - Junior row
 */

export const juniorInScope = async (id: string, scope: AcademyScope) => {
  const row = await prisma.academyJunior.findFirst({
    where: { id, session: scope.session, ...scope.juniors },
    include: { session: true, account: { select: { displayName: true } } },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Load a review inside scope or fail
 * @param {string} id - Review identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string, status: ReviewStatusName, stage: AcademyStageName, advice: ReviewAdviceName }>} - Review row
 */

export const reviewInScope = async (id: string, scope: AcademyScope) => {
  const row = await prisma.academyReview.findFirst({
    where: { id, junior: { session: scope.session, ...scope.juniors } },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Load a note inside scope or fail
 * @param {string} id - Note identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string }>} - Note row
 */

export const noteInScope = async (id: string, scope: AcademyScope) => {
  const row = await prisma.juniorNote.findFirst({
    where: { id, junior: { session: scope.session, ...scope.juniors } },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Load an objective inside scope or fail
 * @param {string} id - Objective identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<{ id: string, juniorId: string }>} - Objective row
 */

export const objectiveInScope = async (id: string, scope: AcademyScope) => {
  const row = await prisma.juniorObjective.findFirst({
    where: { id, junior: { session: scope.session, ...scope.juniors } },
  })
  if (!row) throw notFound()

  return row
}

/**
 * Read the trainings a function covers
 * @param {string} functionId - Function identifier
 * @param {string} [dispositifId] - Dispositif identifier
 * @return {Promise<object[]>} - Trainings in display order
 */

export const sessionTrainings = async (functionId: string, dispositifId?: string | null) => {
  const [rows, fn] = await Promise.all([
    prisma.training.findMany({
      where: {
        OR: [{ functionId: null }, { functionId }],
        ...(dispositifId !== undefined
          ? { AND: [{ OR: [{ dispositifId: null }, { dispositifId }] }] }
          : {}),
      },
      orderBy: [{ period: 'asc' }, { position: 'asc' }],
    }),
    prisma.jobFunction.findUnique({ where: { id: functionId }, select: { name: true } }),
  ])
  const trade = fn ? tradeOfFunction(fn.name) : null

  // A course for other trades is ignored
  return rows.filter((row) => {
    const course = row.curriculumKey ? courseByKey(row.curriculumKey) : undefined

    return !course || !trade || course.functions.length === 0 || course.functions.includes(trade)
  })
}
