import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  removeSession,
  sessionFields,
  updateSession,
} from '@/core/services/recruitment/RecruitmentService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Edit a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, raw, scope }) => {
    const perimeter = await scope()
    const parsed = parseFormValues(await sessionFields(perimeter), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateSession(params.id, parsed.values, perimeter)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Drop a recruitment session', tags: ['recruitment'] },
  handler: async ({ params, scope }) => removeSession(params.id, await scope()),
})
