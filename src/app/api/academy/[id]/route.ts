import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { removeSession, sessionFields, updateSession } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Edit an academy session', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const parsed = parseFormValues(await sessionFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateSession(params.id, academyScope(session, access), parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Drop an academy session', tags: ['academy'] },
  handler: ({ params, session, access }) => removeSession(params.id, academyScope(session, access)),
})
