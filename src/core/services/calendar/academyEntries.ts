import 'server-only'

import { isReviewOpen, REVIEW_PURPOSES } from '@/core/lib/academy/reviewTemplates'
import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { readList, readText } from '@/core/lib/forms/values'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
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

    return { ...patch, trainerId: junior.trainerId, memberIds: null }
  }

  // An interview convenes the junior, their trainer and the responsables
  const trainerId = readText(values, 'trainerId') ?? actorId
  const responsableIds =
    template.purpose === EventPurposes.PanelInterview ? readList(values, 'responsableIds') : []

  return {
    ...patch,
    trainerId,
    rollCall: true,
    memberIds: [...new Set([junior.accountId, trainerId, ...responsableIds])],
  }
}
