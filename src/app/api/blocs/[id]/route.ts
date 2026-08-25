import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeBlock, updateBlock } from '@/core/services/academy/TrainingContentService'
import { blockFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Edit a block', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(blockFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateBlock(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Drop a block', tags: ['academy'] },
  handler: ({ params }) => removeBlock(params.id),
})
