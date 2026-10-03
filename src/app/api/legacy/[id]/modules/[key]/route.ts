import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { gradeModule } from '@/core/services/academy/LegacyService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: Permissions.LegacyManage,
  descriptor: { summary: 'Give the evaluator note of a Legacy module', tags: ['legacy'] },
  handler: async ({ params, raw, session }) => {
    if (typeof raw.score !== 'number') {
      throw invalidInput([{ field: 'score', message: FORM_COPY.notANumber }])
    }

    return gradeModule(params.id, params.key, raw.score, session.id)
  },
})
