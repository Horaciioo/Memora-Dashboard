import 'server-only'

import { isReviewOpen, REVIEW_PURPOSES, reviewOpensAt } from '@/core/lib/academy/reviewTemplates'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_EVENT_COPY } from '@/declarations/calendar/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FormValues } from '@/types/forms'
import type { AcademyStageName, ReviewStatusName } from '@/utils/constants/hierarchy'
import { EventPurposes } from '@/utils/constants/workflow'

/**
 * What an academy template fixes on an entry
 * @typedef {Object} AcademyPatch
 * @property {string | null} juniorId - Junior the entry is about
 * @property {string | null} trainerId - Trainer who receives them
 * @property {string | null} [accountId] - Account of that junior
 * @property {string | null} [sessionId] - Promotion of that junior
 * @property {true} [rollCall] - Asks the convened members to confirm
 * @property {string[] | null} memberIds - Members convened, none when the entry is not an interview
 */

export interface AcademyPatch {
  juniorId: string | null
  trainerId: string | null
  accountId?: string | null
  sessionId?: string | null
  rollCall?: true
  memberIds: string[] | null
}

// Nothing to fix on an entry of another kind
const NONE: AcademyPatch = { juniorId: null, trainerId: null, memberIds: null }

/**
 * Settle what an academy template fixes on an entry: the junior, their trainer and who is convened
 * @param {string | null} templateId - Template the entry starts from
 * @param {FormValues} values - Parsed body
 * @param {string} actorId - Member posting it, the trainer by default
 * @param {AcademyScope} academy - Juniors the member may plan for
 * @return {Promise<AcademyPatch>} - What to write
 */

export const resolveAcademyEntry = async (
  templateId: string | null,
  values: FormValues,
  actorId: string,
  academy: AcademyScope
): Promise<AcademyPatch> => {
  if (!templateId) return NONE

  const template = await prisma.eventTemplate.findUnique({
    where: { id: templateId },
    select: { purpose: true },
  })
  if (!template?.purpose) return NONE

  const juniorId = readText(values, 'juniorId')
  if (!juniorId) throw invalidInput([{ field: 'juniorId', message: FORM_COPY.required }])

  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: academy.session, ...academy.juniors },
    include: { reviews: { select: { stage: true, status: true } } },
  })
  if (!junior) throw invalidInput([{ field: 'juniorId', message: FORM_COPY.notAnOption }])

  const patch = { juniorId, accountId: junior.accountId, sessionId: junior.sessionId }

  // A check-in is planned once for a period
  if (REVIEW_PURPOSES.includes(template.purpose)) {
    const open = isReviewOpen(template.purpose, {
      stage: junior.stage as AcademyStageName,
      reviews: junior.reviews.map((review) => ({
        stage: review.stage as AcademyStageName,
        status: review.status as ReviewStatusName,
      })),
    })
    if (!open) throw conflict(ACADEMY_COPY.reviewNotPlannable)

    // Declared during the week before the end of the period, not earlier
    const opensAt = reviewOpensAt(template.purpose, {
      dueOne: junior.reviewOneDueAt,
      dueFinal: junior.reviewFinalDueAt,
    })
    if (opensAt && opensAt.getTime() > Date.now()) throw conflict(ACADEMY_EVENT_COPY.reviewNotYet)

    return { ...patch, trainerId: junior.trainerId, memberIds: null }
  }

  // An interview is planned within a promotion, the junior must belong to it
  const sessionId = readText(values, 'sessionId')
  if (!sessionId) throw invalidInput([{ field: 'sessionId', message: FORM_COPY.required }])
  if (sessionId !== junior.sessionId) {
    throw invalidInput([{ field: 'juniorId', message: FORM_COPY.notAnOption }])
  }

  // An interview convenes the junior, their trainer and, with responsables, the leads of the creator's teams
  const trainerId = readText(values, 'trainerId') ?? actorId
  const responsableIds =
    template.purpose === EventPurposes.PanelInterview ? await sessionResponsables(sessionId) : []

  return {
    ...patch,
    trainerId,
    rollCall: true,
    memberIds: [...new Set([junior.accountId, trainerId, ...responsableIds])],
  }
}

/**
 * Responsables of the teams of the creator a promotion recruits for
 * @param {string} sessionId - Promotion identifier
 * @return {Promise<string[]>} - Account identifiers
 */

const sessionResponsables = async (sessionId: string): Promise<string[]> => {
  const session = await prisma.academySession.findUnique({
    where: { id: sessionId },
    select: { recruitmentSession: { select: { youtuberId: true } } },
  })
  const youtuberId = session?.recruitmentSession?.youtuberId
  if (!youtuberId) return []

  const leads = await prisma.teamLead.findMany({
    where: { team: { youtuberId, archived: false } },
    select: { accountId: true },
  })

  return [...new Set(leads.map((lead) => lead.accountId))]
}

/**
 * Refuse an entry a trainer may not plan: only the academy templates are theirs
 * @param {string | null} templateId - Template the entry starts from
 * @param {boolean} isLead - Member sits at responsable level or above
 * @return {Promise<void>} - Throws when the template is not an academy one
 */

export const assertPlannable = async (
  templateId: string | null,
  isLead: boolean
): Promise<void> => {
  if (isLead) return

  const template = templateId
    ? await prisma.eventTemplate.findUnique({
        where: { id: templateId },
        select: { purpose: true },
      })
    : null
  if (!template?.purpose) throw forbidden()
}
