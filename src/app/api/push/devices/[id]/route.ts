import { createProtectedRoute } from '@/core/lib/http/route'
import { removePushDevice } from '@/core/services/push'

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Forget one of my push devices', tags: ['push'] },
  handler: async ({ params, session }) => {
    await removePushDevice(session.id, params.id)

    return { id: params.id }
  },
})
