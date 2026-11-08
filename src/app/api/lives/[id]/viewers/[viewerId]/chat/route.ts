import { createProtectedRoute } from '@/core/lib/http/route'
import { eraseViewerChat, viewerChatHistory } from '@/core/services/lives/ChatHistoryService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the chat history of a viewer', tags: ['lives'] },
  handler: async ({ params, query, scope }) =>
    viewerChatHistory(params.id, params.viewerId, await scope(), query.get('cursor')),
})

export const DELETE = createProtectedRoute({
  permission: Permissions.LiveInspect,
  descriptor: { summary: 'Erase the chat kept on a viewer', tags: ['lives'] },
  handler: async ({ params, scope }) => ({
    erased: await eraseViewerChat(params.id, params.viewerId, await scope()),
  }),
})
