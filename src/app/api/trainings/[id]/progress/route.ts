import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { setMyTraining } from '@/core/services/academy/AcademyService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'
import type { MyTrainingAction } from '@/types/academy'

// Moves a junior may apply to their own attendance
const ACTIONS: MyTrainingAction[] = ['start', 'resume', 'restart', 'abandon', 'complete']

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyTrainingComplete,
  descriptor: { summary: 'Move a junior’s own attendance on a training', tags: ['academy'] },
  handler: async ({ params, raw, session }) => {
    const action = ACTIONS.find((candidate) => candidate === raw.action)
    if (!action) throw invalidInput([{ field: 'action', message: FORM_COPY.required }])

    const trainings = await setMyTraining(params.id, session.id, action)

    if (action === 'complete') {
      const training = trainings.find((entry) => entry.id === params.id)

      await recordEvent({
        eventType: 'TrainingValidated',
        actorId: session.id,
        subjectId: session.id,
        targetType: 'training',
        targetId: params.id,
        summary: training?.name ?? params.id,
      })
    }

    return trainings
  },
})
