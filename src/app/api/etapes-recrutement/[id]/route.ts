import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeStep, stepFields, updateStep } from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Edit a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const parsed = parseFormValues(stepFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateStep(params.id, parsed.values, await scope())
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a recruitment timeline step', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeStep(params.id, await scope()),
})
