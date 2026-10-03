import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import type { ExerciseAnswer } from '@/core/lib/curriculum/scoring'
import { submitModuleExercise } from '@/core/services/academy/LegacyService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.LegacySelf,
  descriptor: { summary: 'Answer one exercise of a Legacy module', tags: ['legacy'] },
  handler: async ({ params, raw, session }) => {
    const blockKey = typeof raw.blockKey === 'string' ? raw.blockKey : ''
    if (!blockKey) throw invalidInput([{ field: 'blockKey', message: FORM_COPY.required }])

    return submitModuleExercise(
      params.id,
      params.key,
      session,
      blockKey,
      (raw.answer ?? '') as ExerciseAnswer
    )
  },
})
