import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { addComment, commentFields } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  status: 201,
  descriptor: { summary: 'Leave a remark on a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, session, scope }) => {
    const parsed = parseFormValues(commentFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return addComment(params.id, parsed.values, session.id, await scope())
  },
})
