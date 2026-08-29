import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { proseFields, saveReview } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Write the bilan of a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(proseFields('review'), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return saveReview(params.id, parsed.values, await scope())
  },
})
