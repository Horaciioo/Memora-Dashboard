import 'server-only'
import { prisma } from '@/core/lib/db'
import { hasSeenGuide } from '@/core/services/preferences/GuideService'
import { COURSES } from '@/declarations/academy/curriculum'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import { AcademyJuniorStatuses, AcademyPeriods, AcademyStages } from '@/utils/constants/hierarchy'
import type { AcademyStageName } from '@/utils/constants/hierarchy'

/**
 * Stages from which the secondary courses open
 * @type {AcademyStageName[]}
 */

export const PRACTICE_STAGES: AcademyStageName[] = [
  AcademyStages.Practice,
  AcademyStages.ReviewFinal,
  AcademyStages.Bonus,
]

/**
 * Whether the specialisations opened for a junior who has not been told yet
 * @param {string} accountId - Junior account
 * @return {Promise<boolean>} - Bubble due
 */

export const hasNewSpecialisations = async (accountId: string): Promise<boolean> => {
  const [junior, seen] = await Promise.all([
    prisma.academyJunior.findFirst({
      where: { accountId, status: AcademyJuniorStatuses.Active },
      select: { stage: true },
      orderBy: { startedAt: 'desc' },
    }),
    hasSeenGuide(accountId, GUIDE_KEYS.specialisations),
  ])

  return !seen && junior !== null && PRACTICE_STAGES.includes(junior.stage)
}

// Catalogue written once per server process
let synced: Promise<void> | null = null

/**
 * Write the courses declared in code onto their training rows
 * @return {Promise<void>} - Synced
 */

export const syncCurriculum = (): Promise<void> => {
  synced ??= (async () => {
    const functions = await prisma.jobFunction.findMany({ select: { id: true, name: true } })
    const functionIds = new Map(functions.map((row) => [row.name, row.id]))

    for (const [position, course] of COURSES.entries()) {
      const data = {
        name: course.name,
        summary: course.summary,
        period:
          course.track === 'indispensable' ? AcademyPeriods.Discovery : AcademyPeriods.Practice,
        mandatory: course.track === 'indispensable',
        // A course for one trade hangs on it
        functionId:
          course.functions.length === 1 ? (functionIds.get(course.functions[0]!) ?? null) : null,
        position,
      }

      await prisma.training.upsert({
        where: { curriculumKey: course.key },
        update: data,
        create: { ...data, curriculumKey: course.key },
      })
    }
  })().catch((error: unknown) => {
    synced = null
    throw error
  })

  return synced
}
