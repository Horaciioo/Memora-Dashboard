import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeQuestion, updateQuestion } from '@/core/services/academy/TrainingContentService'
import { questionFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Edit a quiz question', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(questionFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateQuestion(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Drop a quiz question', tags: ['academy'] },
  handler: ({ params }) => removeQuestion(params.id),
})
