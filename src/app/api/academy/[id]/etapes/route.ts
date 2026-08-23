import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createStep, stepFields } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  status: 201,
  descriptor: { summary: 'Note a moment on the session thread', tags: ['academy'] },
  handler: async ({ params, raw, session }) => {
    const parsed = parseFormValues(await stepFields(params.id), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createStep(params.id, session.id, parsed.values)
  },
})
