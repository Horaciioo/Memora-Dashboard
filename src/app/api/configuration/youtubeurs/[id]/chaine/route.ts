import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readTwitchChannel, saveTwitchChannel } from '@/core/services/platforms/ChannelService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.ReferenceRead,
  descriptor: { summary: 'Read the Twitch channel of a creator', tags: ['reference'] },
  handler: ({ params }) => readTwitchChannel(params.id),
})

export const PUT = createProtectedRoute({
  permission: Permissions.ReferenceManage,
  descriptor: { summary: 'Set the Twitch channel of a creator', tags: ['reference'] },
  handler: async ({ params, raw, session, access }) => {
    // The channel decides whose chat the Mod View acts on
    if (!access.isAdmin) throw forbidden()

    const channel = await saveTwitchChannel(
      params.id,
      typeof raw.login === 'string' ? raw.login : ''
    )

    await recordEvent({
      eventType: 'ReferenceChanged',
      actorId: session.id,
      targetType: 'youtuber',
      targetId: params.id,
      summary: `${CHANNEL_COPY.twitch} · ${channel?.login ?? ''}`,
    })

    return channel
  },
})
