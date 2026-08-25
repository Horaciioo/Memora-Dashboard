import { createProtectedRoute } from '@/core/lib/http/route'
import { readTrainingContentForJunior } from '@/core/services/academy/TrainingContentService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyTrainingComplete,
  descriptor: { summary: 'Read a training’s content the way a junior sees it', tags: ['academy'] },
  handler: ({ params, session }) => readTrainingContentForJunior(params.id, session.id),
})
