import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { uploadPageMedia, viewerOf } from '@/core/services/pages'
import { FILE_COPY } from '@/declarations/ui/copy'

export const POST = createProtectedRoute({
  status: 201,
  rateLimit: 'upload',
  descriptor: { summary: 'Store a picture on a page', tags: ['pages'] },
  handler: ({ params, raw, session }) => {
    if (!(raw.file instanceof File)) throw invalidInput([], FILE_COPY.missing)

    return uploadPageMedia(params.id, viewerOf(session), raw.file)
  },
})
