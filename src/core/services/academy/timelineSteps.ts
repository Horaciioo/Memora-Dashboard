import 'server-only'

import { prisma } from '@/core/lib/db'
import { AcademyStages, StepAnchors } from '@/utils/constants/hierarchy'
import type { AcademyStageName, StepAnchorName, StepOwnerName } from '@/utils/constants/hierarchy'
import { addDays } from '@/utils/format/days'

/**
 * Compute the day a DAY-anchored template step falls on
 * @param {Date} startsAt - Session start date
 * @param {number} offsetDays - Signed day offset
 * @return {Date} - Resolved day
 */

const dayOffset = (startsAt: Date, offsetDays: number): Date => addDays(startsAt, offsetDays)

/**
 * Copy a batch of PIMT templates onto the timeline as steps
 * @param {object[]} templates - Templates matched for this instantiation
 * @param {Date} startsAt - Session start date
 * @param {string} sessionId - Session identifier
 * @param {string} [juniorId] - Junior identifier, omitted for session-wide steps
 * @return {Promise<void>} - Instantiated
 */

const instantiateSteps = async (
  templates: {
    id: string
    title: string
    description: string | null
    stage: AcademyStageName
    anchor: StepAnchorName
    offset: number
    owner: StepOwnerName
    required: boolean
  }[],
  startsAt: Date,
  sessionId: string,
  juniorId?: string
): Promise<void> => {
  if (templates.length === 0) return

  await prisma.academyStep.createMany({
    data: templates.map((template) => ({
      sessionId,
      juniorId: juniorId ?? null,
      templateId: template.id,
      kind: null,
      title: template.title,
      notes: template.description,
      stage: template.stage,
      anchor: template.anchor,
      offset: template.offset,
      owner: template.owner,
      required: template.required,
      scheduledAt:
        template.anchor === StepAnchors.Day ? dayOffset(startsAt, template.offset) : null,
    })),
  })
}

/**
 * Instantiate the session-wide preparation steps of a PIMT trame, ahead of any junior
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function the session is scoped to
 * @param {Date} startsAt - Session start date
 * @return {Promise<void>} - Instantiated
 */

export const instantiateSessionSteps = async (
  sessionId: string,
  functionId: string,
  startsAt: Date
): Promise<void> => {
  const templates = await prisma.pimStepTemplate.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      dispositifId: null,
      stage: AcademyStages.Preparation,
    },
  })

  await instantiateSteps(templates, startsAt, sessionId)
}

/**
 * Instantiate the individual steps of a PIMT trame onto a junior's own timeline
 * @param {string} juniorId - Junior identifier
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function the session is scoped to
 * @param {string} dispositifId - Junior's own dispositif
 * @param {Date} startsAt - Session start date
 * @return {Promise<void>} - Instantiated
 */

export const instantiateJuniorSteps = async (
  juniorId: string,
  sessionId: string,
  functionId: string,
  dispositifId: string | null,
  startsAt: Date
): Promise<void> => {
  const templates = await prisma.pimStepTemplate.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      AND: [{ OR: [{ dispositifId: null }, ...(dispositifId ? [{ dispositifId }] : [])] }],
      stage: { not: AcademyStages.Preparation },
    },
  })

  await instantiateSteps(templates, startsAt, sessionId, juniorId)
}

/**
 * Lay the steps only one dispositif carries onto a junior who just picked it
 * @param {string} juniorId - Junior identifier
 * @param {string} sessionId - Session identifier
 * @param {string} functionId - Function the session is scoped to
 * @param {string} dispositifId - Dispositif picked
 * @param {Date} startsAt - Session start date
 * @return {Promise<void>} - Instantiated
 */

export const instantiateDispositifSteps = async (
  juniorId: string,
  sessionId: string,
  functionId: string,
  dispositifId: string,
  startsAt: Date
): Promise<void> => {
  const templates = await prisma.pimStepTemplate.findMany({
    where: {
      OR: [{ functionId: null }, { functionId }],
      dispositifId,
      stage: { not: AcademyStages.Preparation },
    },
  })

  await instantiateSteps(templates, startsAt, sessionId, juniorId)
}

/**
 * Re-anchor every open day step of a session on its real start
 * @param {string} sessionId - Session identifier
 * @param {Date} startsAt - Day the session actually started
 * @return {Promise<void>} - Rescheduled
 */

export const rescheduleSteps = async (sessionId: string, startsAt: Date): Promise<void> => {
  const open = await prisma.academyStep.findMany({
    where: { sessionId, anchor: StepAnchors.Day, validatedAt: null, offset: { not: null } },
    select: { id: true, offset: true },
  })

  await prisma.$transaction(
    open.map((step) =>
      prisma.academyStep.update({
        where: { id: step.id },
        data: { scheduledAt: dayOffset(startsAt, step.offset ?? 0) },
      })
    )
  )
}
