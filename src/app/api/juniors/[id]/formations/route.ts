import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { setTrainingRecord } from '@/core/services/academy/AcademyService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Validate or revoke a training', tags: ['academy'] },
  handler: ({ params, raw, session }) => {
    const trainingId = String(raw.trainingId ?? '')
    if (!trainingId) throw invalidInput([{ field: 'trainingId', message: FORM_COPY.required }])

    return setTrainingRecord(params.id, trainingId, raw.validated === true, session.id)
  },
})
