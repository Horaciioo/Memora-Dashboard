import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { setTrainingRecord } from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Validate or revoke a training', tags: ['academy'] },
  handler: async ({ params, raw, session, access }) => {
    const trainingId = String(raw.trainingId ?? '')
    if (!trainingId) throw invalidInput([{ field: 'trainingId', message: FORM_COPY.required }])

    const validated = raw.validated === true
    const juniors = await setTrainingRecord(
      params.id,
      academyScope(session, access),
      trainingId,
      validated,
      session.id
    )

    // Revoking is a correction, only a clearance is worth a journal line
    if (validated) {
      const training = await prisma.training.findUnique({ where: { id: trainingId } })
      const learner = juniors.find((entry) => entry.id === params.id)?.accountId

      await recordEvent({
        eventType: 'TrainingValidated',
        actorId: session.id,
        subjectId: learner,
        targetType: 'training',
        targetId: trainingId,
        summary: training?.name ?? trainingId,
      })

      await notify({
        kind: 'TrainingValidated',
        recipients: [learner],
        actorId: session.id,
        target: 'training',
        targetId: trainingId,
        subject: training?.name ?? null,
      })
    }

    return juniors
  },
})
