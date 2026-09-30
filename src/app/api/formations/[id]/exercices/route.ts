import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import type { ExerciseAnswer } from '@/core/lib/curriculum/scoring'
import { submitExercise } from '@/core/services/academy/CurriculumService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

export const POST = createProtectedRoute({
  descriptor: { summary: 'Answer one exercise of an interactive course', tags: ['academy'] },
  handler: async ({ params, raw, session }) => {
    const blockKey = typeof raw.blockKey === 'string' ? raw.blockKey : ''
    if (!blockKey) throw invalidInput([{ field: 'blockKey', message: FORM_COPY.required }])

    return submitExercise(params.id, session, blockKey, (raw.answer ?? '') as ExerciseAnswer)
  },
})
