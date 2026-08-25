import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createBlock } from '@/core/services/academy/TrainingContentService'
import { blockFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  status: 201,
  descriptor: { summary: 'Add a block to a chapter', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(blockFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createBlock(params.id, parsed.values)
  },
})
