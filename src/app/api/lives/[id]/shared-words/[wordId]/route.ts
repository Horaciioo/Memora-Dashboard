import { createProtectedRoute } from '@/core/lib/http/route'
import { removeSharedWord } from '@/core/services/lives/SharedWordService'
import { Permissions } from '@/utils/constants/permissions'

export const DELETE = createProtectedRoute({
  permission: Permissions.LiveSharedWords,
  rateLimit: 'moderation',
  descriptor: { summary: 'Take a shared watch word back', tags: ['lives'] },
  handler: async ({ params, scope }) => removeSharedWord(params.id, params.wordId, await scope()),
})
