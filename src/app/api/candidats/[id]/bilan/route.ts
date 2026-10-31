import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalCandidate } from '@/core/lib/recruitment/signal'
import { proseFields, saveReview } from '@/core/services/recruitment'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Write the bilan of a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(proseFields('review'), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    const candidate = await saveReview(params.id, parsed.values, await scope())
    await signalCandidate(params.id)

    return candidate
  },
})
