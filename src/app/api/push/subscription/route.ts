import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readSubscriptionInput } from '@/core/lib/push'
import { removePushSubscription, savePushSubscription } from '@/core/services/push'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

export const POST = createProtectedRoute({
  status: 201,
  descriptor: { summary: 'Receive pushes on this browser', tags: ['push'] },
  handler: async ({ raw, request, session }) => {
    const input = readSubscriptionInput(raw)
    if (!input) throw invalidInput([{ field: 'endpoint', message: FORM_COPY.notAnOption }])

    return savePushSubscription(session.id, input, request.headers.get('user-agent'))
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Stop pushes on this browser', tags: ['push'] },
  handler: async ({ raw, session }) => {
    const endpoint = typeof raw.endpoint === 'string' ? raw.endpoint : ''
    await removePushSubscription(session.id, endpoint)

    return { removed: true }
  },
})
