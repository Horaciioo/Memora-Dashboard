import { createBinaryRoute } from '@/core/lib/http/route'
import { readFile } from '@/core/services/system/FileService'

// A stored file never changes, so the browser may hold it for a day
const CACHE_SECONDS = 86_400

export const GET = createBinaryRoute({
  descriptor: { summary: 'Serve a stored file', tags: ['files'] },
  handler: async ({ params }) => ({
    ...(await readFile(params.id)),
    maxAgeSeconds: CACHE_SECONDS,
  }),
})
