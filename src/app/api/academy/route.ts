import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  advanceJunior,
  listJuniors,
  setTrainingRecord,
} from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'List the juniors in training', tags: ['academy'] },
  handler: () => listJuniors(),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Validate a training or advance a junior', tags: ['academy'] },
  handler: async ({ raw, session }) => {
    const accountId = String(raw.accountId ?? '')
    if (!accountId) throw invalidInput([{ field: 'accountId', message: FORM_COPY.required }])

    // Advancing a junior carries no training identifier
    if (raw.trainingId === undefined) {
      const juniors = await advanceJunior(accountId)

      await recordEvent({
        eventType: 'AcademyAdvanced',
        actorId: session.id,
        subjectId: accountId,
        targetType: 'member',
        targetId: accountId,
        summary: accountId,
      })

      return juniors
    }

    const juniors = await setTrainingRecord(
      accountId,
      String(raw.trainingId),
      raw.validated === true,
      session.id
    )

    await recordEvent({
      eventType: 'TrainingValidated',
      actorId: session.id,
      subjectId: accountId,
      targetType: 'member',
      targetId: accountId,
      summary: String(raw.trainingId),
    })

    return juniors
  },
})
