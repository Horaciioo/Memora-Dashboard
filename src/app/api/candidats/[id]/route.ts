import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  candidateFields,
  removeCandidate,
  updateCandidate,
} from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Edit a candidate', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(await candidateFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateCandidate(params.id, parsed.values, await scope())
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a candidate', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeCandidate(params.id, await scope()),
})
