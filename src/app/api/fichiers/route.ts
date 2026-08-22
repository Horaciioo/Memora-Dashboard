import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { storeFile } from '@/core/services/system/FileService'
import { FILE_COPY } from '@/declarations/ui/copy'
import { STORAGE_BUCKETS } from '@/declarations/system/storage'
import type { StorageBucket } from '@/types/storage'

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Store an uploaded file', tags: ['files'] },
  handler: async ({ raw }) => {
    const file = raw.file
    if (!(file instanceof File)) throw invalidInput([], FILE_COPY.missing)

    const bucket = typeof raw.bucket === 'string' ? raw.bucket : ''
    if (!STORAGE_BUCKETS.has(bucket)) throw invalidInput([], FILE_COPY.unknownBucket)

    return storeFile(bucket as StorageBucket, file)
  },
})
