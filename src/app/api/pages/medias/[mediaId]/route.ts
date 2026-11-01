import { createMediaRoute } from '@/core/lib/http/route'
import { authorizePageMedia, describePageMedia, readPageMedia, viewerOf } from '@/core/services/pages'

export const GET = createMediaRoute({
  descriptor: { summary: 'Serve a page picture to who may read the page', tags: ['pages'] },
  describe: ({ mediaId }) => describePageMedia(mediaId ?? ''),
  authorize: ({ mediaId }, session) => authorizePageMedia(mediaId ?? '', viewerOf(session)),
  read: ({ mediaId }) => readPageMedia(mediaId ?? ''),
})
