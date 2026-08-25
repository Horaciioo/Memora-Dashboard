import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { removeChapter, updateChapter } from '@/core/services/academy/TrainingContentService'
import { chapterFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Edit a chapter', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(chapterFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateChapter(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Drop a chapter', tags: ['academy'] },
  handler: ({ params }) => removeChapter(params.id),
})
