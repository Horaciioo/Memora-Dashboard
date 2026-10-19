import { createProtectedRoute } from '@/core/lib/http/route'
import { readLiveEmotes } from '@/core/services/lives/ModViewService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the emotes of a live chat', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    readLiveEmotes(params.id, await scope(), session.id, session.permissions),
})
