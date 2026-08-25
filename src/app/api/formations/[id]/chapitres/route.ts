import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createChapter } from '@/core/services/academy/TrainingContentService'
import { chapterFields } from '@/core/services/academy/trainingContentFields'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  status: 201,
  descriptor: { summary: 'Add a chapter to a training', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const parsed = parseFormValues(chapterFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createChapter(params.id, parsed.values)
  },
})
