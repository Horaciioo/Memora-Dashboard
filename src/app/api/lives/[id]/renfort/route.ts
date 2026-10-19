import { createProtectedRoute } from '@/core/lib/http/route'
import {
  addReinforcements,
  readReinforcementChoices,
} from '@/core/services/lives/ReinforcementService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  descriptor: { summary: 'Read who may come as reinforcement', tags: ['lives'] },
  handler: async ({ params, scope }) => ({
    options: await readReinforcementChoices(params.id, await scope()),
  }),
})

export const POST = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  descriptor: { summary: 'Call members to a live as reinforcement', tags: ['lives'] },
  handler: async ({ params, raw, session, scope }) => {
    const accountIds = Array.isArray(raw.accountIds)
      ? raw.accountIds.filter((id): id is string => typeof id === 'string')
      : []

    await addReinforcements({
      liveId: params.id,
      accountIds,
      actorId: session.id,
      scope: await scope(),
    })

    await recordEvent({
      eventType: 'LiveReinforced',
      actorId: session.id,
      targetType: 'live',
      targetId: params.id,
      summary: String(accountIds.length),
    })

    // A null answer reads as a failure client side
    return { added: accountIds.length }
  },
})
