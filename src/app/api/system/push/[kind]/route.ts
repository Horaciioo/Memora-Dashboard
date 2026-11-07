import { forbidden, notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { samplePushPayload } from '@/core/lib/push'
import { sendTestPush } from '@/core/services/push'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AccessManage,
  rateLimit: 'lookup',
  descriptor: { summary: 'Send one catalogue push to my devices', tags: ['system'] },
  handler: async ({ params, session, access }) => {
    // System holders only
    if (!access.isSystem) throw forbidden()
    if (!NOTIFICATION_KIND_REGISTRY.has(params.kind)) throw notFound()

    const payload = samplePushPayload(params.kind, session.displayName)
    if (!payload) throw notFound()

    return { reached: await sendTestPush({ accountId: session.id, payload, kind: params.kind }) }
  },
})
