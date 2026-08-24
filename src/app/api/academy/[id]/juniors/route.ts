import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { createJunior, juniorFields } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  status: 201,
  descriptor: { summary: 'Take a moderator into a session', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const parsed = parseFormValues(await juniorFields(params.id), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createJunior(params.id, academyScope(session, access), parsed.values)
  },
})
