import { createMediaRoute } from '@/core/lib/http/route'
import { describeFile, readFileBytes } from '@/core/services/system/FileService'

export const GET = createMediaRoute({
  descriptor: { summary: 'Serve a stored file', tags: ['files'] },
  describe: ({ id }) => describeFile(id),
  read: ({ id }) => readFileBytes(id),
})
