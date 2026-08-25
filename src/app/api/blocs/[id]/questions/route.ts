import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createQuestion } from '@/core/services/academy/TrainingContentService'
import { questionFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  status: 201,
  descriptor: { summary: 'Add a question to a quiz block', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(questionFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createQuestion(params.id, parsed.values)
  },
})
