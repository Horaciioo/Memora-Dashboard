import 'server-only'

import { pushRoomEvent } from '@/core/lib/lives/room'
import {
  readCategoryArt,
  readChannelTags,
  readPin,
  readStream,
} from '@/core/lib/platforms/twitch/helix'
import { readTwitchSeat } from '@/core/services/platforms/PlatformAccountService'
import type { PinnedMessage } from '@/types/modview'

// Stream as Twitch answers it
export type LiveStream = NonNullable<Awaited<ReturnType<typeof readStream>>>

// What each live last told its room
const lastTold = new Map<
  string,
  {
    viewers: number | null | undefined
    pin: string | null | undefined
    category: string | null | undefined
    tags: string | undefined
  }
>()

/**
 * Signature of a pin, to spot a change
 * @param {PinnedMessage | null} pin - Pin
 * @return {string | null} - Signature
 */

const pinKey = (pin: PinnedMessage | null): string | null =>
  pin ? `${pin.messageId}:${pin.endsAt ?? ''}` : null

/**
 * Tell a live's room what Twitch shows beyond the chat: spectators and the pinned message
 * @param {Object} input - Live coordinates
 * @param {string} input.liveId - Live
 * @param {string} input.holderId - Member whose token reads
 * @param {string} input.broadcasterId - Channel
 * @return {Promise<LiveStream | null | undefined>} - Stream read, null offline, undefined unanswered
 */

export const pollLiveState = async (input: {
  liveId: string
  holderId: string
  broadcasterId: string
}): Promise<LiveStream | null | undefined> => {
  const seat = await readTwitchSeat(input.holderId).catch(() => null)
  if (!seat?.ok) return undefined

  const holder = {
    accessToken: seat.accessToken,
    moderatorId: seat.moderatorId,
    broadcasterId: input.broadcasterId,
  }
  const [stream, pin, tags] = await Promise.all([
    readStream(holder).catch(() => undefined),
    readPin(holder).catch(() => undefined),
    readChannelTags(holder).catch(() => undefined),
  ])
  const told = lastTold.get(input.liveId) ?? {
    viewers: undefined,
    pin: undefined,
    category: undefined,
    tags: undefined,
  }

  // An answer that failed stays silent
  const viewers = stream === undefined ? told.viewers : (stream?.viewers ?? null)
  if (viewers !== told.viewers && viewers !== undefined) {
    pushRoomEvent(input.liveId, { kind: 'stream', viewers })
  }
  const key = pin === undefined ? told.pin : pinKey(pin)
  if (key !== told.pin && pin !== undefined) {
    pushRoomEvent(input.liveId, { kind: 'pin', pin })
  }

  // The cover follows the category the streamer switches to
  const category = stream === undefined ? told.category : (stream?.categoryId ?? null)
  if (category !== told.category && stream !== undefined) {
    const art = category ? await readCategoryArt(holder, category).catch(() => null) : null
    pushRoomEvent(input.liveId, {
      kind: 'stream',
      title: stream?.title,
      category: stream?.category ?? null,
      categoryArt: art,
    })
  }

  // The tags follow what the streamer edits on Twitch
  const tagsKey = tags === undefined ? told.tags : JSON.stringify(tags)
  if (tags !== undefined && tagsKey !== told.tags) {
    pushRoomEvent(input.liveId, { kind: 'stream', tags })
  }

  lastTold.set(input.liveId, { viewers, pin: key, category, tags: tagsKey })

  return stream
}

/**
 * Forget a closed live
 * @param {string} liveId - Live
 * @return {void}
 */

export const forgetLiveState = (liveId: string): void => {
  lastTold.delete(liveId)
}
