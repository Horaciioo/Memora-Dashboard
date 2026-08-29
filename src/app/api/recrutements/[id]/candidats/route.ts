import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { candidateFields, createCandidate } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  status: 201,
  descriptor: { summary: 'Add a candidate to a session', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(await candidateFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createCandidate(params.id, parsed.values, await scope())
  },
})
