import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  assertQuizOpenToJunior,
  quizFields,
  submitQuiz,
} from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyTrainingComplete,
  descriptor: { summary: 'Read the quiz form of a block', tags: ['academy'] },
  handler: async ({ params, session }) => {
    await assertQuizOpenToJunior(params.id, session.id)

    return quizFields(params.id)
  },
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyTrainingComplete,
  descriptor: { summary: 'Score a junior’s own answers to a quiz block', tags: ['academy'] },
  handler: async ({ params, raw, session }) => {
    const parsed = parseFormValues(await quizFields(params.id), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return submitQuiz(params.id, session.id, parsed.values)
  },
})
