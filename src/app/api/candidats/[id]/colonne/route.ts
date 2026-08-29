import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { moveCandidate } from '@/core/services/recruitment/RecruitmentService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

// Where the card was dropped, the column and its index inside it
const OUTCOME_FIELD = 'outcomeId'
const INDEX_FIELD = 'index'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Move a candidate into an outcome column', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const outcomeId = raw[OUTCOME_FIELD]
    if (typeof outcomeId !== 'string' || outcomeId === '') {
      throw invalidInput([{ field: OUTCOME_FIELD, message: FORM_COPY.required }])
    }

    const index = typeof raw[INDEX_FIELD] === 'number' ? raw[INDEX_FIELD] : 0
    const moved = await moveCandidate(params.id, outcomeId, index, await scope())

    await recordEvent({
      eventType: 'RecruitmentDecided',
      actorId: session.id,
      targetType: 'recruitment',
      targetId: moved.id,
      summary: moved.discordId,
    })

    return moved
  },
})
