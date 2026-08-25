import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeChoice, updateChoice } from '@/core/services/academy/TrainingContentService'
import { choiceFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Edit a quiz choice', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(choiceFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateChoice(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Drop a quiz choice', tags: ['academy'] },
  handler: ({ params }) => removeChoice(params.id),
})
