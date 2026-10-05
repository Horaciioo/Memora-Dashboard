import { invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readIntent } from '@/core/lib/modview/intent'
import { actOnLive, openModView } from '@/core/services/lives/ModViewService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Open the Mod View of a live', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    openModView(params.id, await scope(), session.id, session.permissions),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  rateLimit: 'moderation',
  descriptor: { summary: 'Carry a moderation gesture out on the platform', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const intent = readIntent(
      typeof raw.intent === 'object' && raw.intent ? (raw.intent as Record<string, unknown>) : {}
    )
    const key = typeof raw.key === 'string' ? raw.key.slice(0, 64) : ''
    if (!intent || !key) throw invalidInput([{ field: 'intent', message: FORM_COPY.notAnOption }])

    // Panel rung and Focus target
    const rawContext =
      typeof raw.context === 'object' && raw.context ? (raw.context as Record<string, unknown>) : {}
    const context = {
      offenseId: typeof rawContext.offenseId === 'string' ? rawContext.offenseId : undefined,
      rung: typeof rawContext.rung === 'number' ? rawContext.rung : undefined,
      onBehalfOfId:
        typeof rawContext.onBehalfOfId === 'string' ? rawContext.onBehalfOfId : undefined,
      targetLogin:
        typeof rawContext.targetLogin === 'string'
          ? rawContext.targetLogin.slice(0, 64)
          : undefined,
    }

    return actOnLive({
      liveId: params.id,
      intent,
      context,
      key,
      scope: await scope(),
      viewerId: session.id,
      held: session.permissions,
    })
  },
})
