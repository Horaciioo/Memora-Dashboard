import 'server-only'

import { prisma } from '@/core/lib/db'
import { readDate, readList, readText } from '@/core/lib/forms/values'
import { OutcomeNames } from '@/declarations/reference/fixed'
import type { FormValues } from '@/types/forms'

/**
 * Values with the rules of a first slot applied
 * @param {FormValues} values - Parsed body
 * @param {string} viewerId - Member setting the date
 * @param {string | null} candidateId - Candidate edited, null on creation
 * @return {Promise<FormValues>} - Viewer leading, outcome moved to scheduled
 */

export const applyFirstSlot = async (
  values: FormValues,
  viewerId: string,
  candidateId: string | null
): Promise<FormValues> => {
  if (!readDate(values, 'interviewAt')) return values

  const before = candidateId
    ? await prisma.recruitmentCandidate.findUniqueOrThrow({
        where: { id: candidateId },
        select: { interviewAt: true },
      })
    : null
  if (before?.interviewAt) return values

  const outcomes = await prisma.recruitmentOutcome.findMany({
    where: { name: { in: [OutcomeNames.ToProcess, OutcomeNames.Scheduled] } },
    select: { id: true, name: true },
  })
  const scheduled = outcomes.find((outcome) => outcome.name === OutcomeNames.Scheduled)
  const toProcess = outcomes.find((outcome) => outcome.name === OutcomeNames.ToProcess)
  const current = readText(values, 'outcomeId')
  const isUntouched = current === null || current === toProcess?.id

  const recruiterIds = readList(values, 'recruiterIds')

  return {
    ...values,
    recruiterIds: recruiterIds.length > 0 ? recruiterIds : [viewerId],
    outcomeId: isUntouched && scheduled ? scheduled.id : current,
  }
}
