import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createChoice } from '@/core/services/academy/TrainingContentService'
import { choiceFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  status: 201,
  descriptor: { summary: 'Add a choice to a quiz question', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(choiceFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createChoice(params.id, parsed.values)
  },
})
