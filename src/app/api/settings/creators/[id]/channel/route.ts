import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { addChannel, readChannels, removeChannel } from '@/core/services/platforms/ChannelService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'Read the channels of a creator', tags: ['reference'] },
  handler: ({ params }) => readChannels(params.id),
})

export const POST = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Add a channel to a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    // The channel decides whose chat the Mod View acts on
    if (!access.isAdmin) throw forbidden()

    const platform = Object.values(LivePlatforms).find((known) => known === raw.platform)
    if (!platform) throw invalidInput([{ field: 'platform', message: CHANNEL_COPY.platform }])

    const channels = await addChannel(
      params.id,
      platform as LivePlatformName,
      typeof raw.value === 'string' ? raw.value : ''
    )

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: `${CHANNEL_COPY.channel}, ${String(raw.value)}`,
    })

    return channels
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Remove a channel from a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    if (!access.isAdmin) throw forbidden()

    const channels = await removeChannel(params.id, typeof raw.id === 'string' ? raw.id : '')

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: CHANNEL_COPY.removed,
    })

    return channels
  },
})
