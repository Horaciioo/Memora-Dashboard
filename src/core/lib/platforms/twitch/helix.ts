import { PlatformError, platformRequest } from '@/core/lib/platforms/http'
import { helixHeaders } from '@/core/lib/platforms/twitch/oauth'
import { HELIX_PATHS, TWITCH_ENDPOINTS, TWITCH_LIMITS } from '@/declarations/platforms/twitch'
import { fragmentsOf } from '@/core/lib/platforms/twitch/fragments'
import type {
  ChatBadge,
  ChatModes,
  BanDetail,
  Chatter,
  ModViewIntent,
  PinnedMessage,
  TwitchEmote,
  UnbanRequest,
} from '@/types/modview'

/**
 * Who acts
 * @typedef {Object} TwitchSeat
 * @property {string} accessToken - The clicking member's token
 * @property {string} moderatorId - Their Twitch user identifier
 * @property {string} broadcasterId - Channel identifier
 */

export interface TwitchSeat {
  accessToken: string
  moderatorId: string
  broadcasterId: string
}

/**
 * One Helix call
 * @typedef {Object} HelixCall
 * @property {'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'} method - Verb
 * @property {string} path - Helix path
 * @property {Record<string, string>} query - Query string
 * @property {unknown} [body] - JSON body
 */

export interface HelixCall {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  query: Record<string, string>
  body?: unknown
}

/**
 * Clip a reason to what Twitch accepts
 * @param {string | null} reason - Reason
 * @return {string | undefined} - Clipped reason
 */

const reasonOf = (reason: string | null): string | undefined =>
  reason ? reason.slice(0, TWITCH_LIMITS.maxReasonLength) : undefined

/**
 * Translate a gesture into its Helix call. Removing a blocked term needs its identifier
 * @param {ModViewIntent} intent - Gesture
 * @param {TwitchSeat} seat - Who acts where
 * @param {string} [termId] - Blocked term identifier
 * @return {HelixCall} - Call
 */

export const helixCallOf = (
  intent: ModViewIntent,
  seat: TwitchSeat,
  termId?: string
): HelixCall => {
  const channel = { broadcaster_id: seat.broadcasterId, moderator_id: seat.moderatorId }

  switch (intent.kind) {
    case 'delete':
      return {
        method: 'DELETE',
        path: HELIX_PATHS.chatMessage,
        query: { ...channel, message_id: intent.messageId },
      }
    case 'warn':
      return {
        method: 'POST',
        path: HELIX_PATHS.warnings,
        query: channel,
        body: { data: { user_id: intent.chatterId, reason: reasonOf(intent.reason) ?? '' } },
      }
    case 'timeout':
      return {
        method: 'POST',
        path: HELIX_PATHS.bans,
        query: channel,
        body: {
          data: {
            user_id: intent.chatterId,
            duration: Math.min(Math.max(1, intent.seconds), TWITCH_LIMITS.maxTimeoutSeconds),
            reason: reasonOf(intent.reason),
          },
        },
      }
    case 'ban':
      return {
        method: 'POST',
        path: HELIX_PATHS.bans,
        query: channel,
        body: { data: { user_id: intent.chatterId, reason: reasonOf(intent.reason) } },
      }
    case 'unban':
      return {
        method: 'DELETE',
        path: HELIX_PATHS.bans,
        query: { ...channel, user_id: intent.chatterId },
      }
    case 'automod':
      return {
        method: 'POST',
        path: HELIX_PATHS.automod,
        query: {},
        body: {
          user_id: seat.moderatorId,
          msg_id: intent.heldId,
          action: intent.approve ? 'ALLOW' : 'DENY',
        },
      }
    case 'unbanRequest':
      return {
        method: 'PATCH',
        path: HELIX_PATHS.unbanRequests,
        query: {
          ...channel,
          unban_request_id: intent.requestId,
          status: intent.approve ? 'approved' : 'denied',
        },
      }
    case 'mode':
      return intent.mode === 'shield'
        ? {
            method: 'PUT',
            path: HELIX_PATHS.shieldMode,
            query: channel,
            body: { is_active: intent.enabled },
          }
        : {
            method: 'PATCH',
            path: HELIX_PATHS.chatSettings,
            query: channel,
            body: settingsOf(intent),
          }
    case 'term':
      if (intent.list === 'allowed') throw new PlatformError(400, 'allowed terms not exposed')

      return intent.remove
        ? {
            method: 'DELETE',
            path: HELIX_PATHS.blockedTerms,
            query: { ...channel, id: termId ?? '' },
          }
        : {
            method: 'POST',
            path: HELIX_PATHS.blockedTerms,
            query: channel,
            body: { text: intent.term },
          }
    case 'say':
      return {
        method: 'POST',
        path: HELIX_PATHS.chatSend,
        query: {},
        body: {
          broadcaster_id: seat.broadcasterId,
          sender_id: seat.moderatorId,
          message: intent.text,
          ...(intent.replyToId ? { reply_parent_message_id: intent.replyToId } : {}),
        },
      }
    case 'pin':
      return {
        method: 'PUT',
        path: HELIX_PATHS.pins,
        query: {
          ...channel,
          message_id: intent.messageId,
          ...(intent.seconds
            ? {
                duration_seconds: String(
                  Math.min(
                    Math.max(TWITCH_LIMITS.minPinSeconds, intent.seconds),
                    TWITCH_LIMITS.maxPinSeconds
                  )
                ),
              }
            : {}),
        },
      }
    case 'unpin':
      return {
        method: 'DELETE',
        path: HELIX_PATHS.pins,
        query: { ...channel, message_id: intent.messageId },
      }
  }
}

/**
 * Chat settings body of a mode change
 * @param {Extract<ModViewIntent, { kind: 'mode' }>} intent - Mode change
 * @return {Record<string, unknown>} - Settings patch
 */

const settingsOf = (intent: Extract<ModViewIntent, { kind: 'mode' }>): Record<string, unknown> => {
  switch (intent.mode) {
    case 'subscribers':
      return { subscriber_mode: intent.enabled }
    case 'followers':
      return {
        follower_mode: intent.enabled,
        // Twitch counts the follow age in minutes
        ...(intent.enabled
          ? {
              follower_mode_duration: Math.min(
                Math.max(0, Math.round((intent.seconds ?? 0) / 60)),
                TWITCH_LIMITS.maxFollowMinutes
              ),
            }
          : {}),
      }
    case 'emotes':
      return { emote_mode: intent.enabled }
    default:
      return {
        slow_mode: intent.enabled,
        ...(intent.enabled
          ? {
              slow_mode_wait_time: Math.min(
                Math.max(3, intent.seconds ?? 30),
                TWITCH_LIMITS.maxSlowSeconds
              ),
            }
          : {}),
      }
  }
}

/**
 * Run one Helix call with the seat's token
 * @param {TwitchSeat} seat - Who acts
 * @param {HelixCall} call - Call
 * @return {Promise<T | null>} - Answer
 */

export const runHelix = <T>(
  seat: Pick<TwitchSeat, 'accessToken' | 'moderatorId'>,
  call: HelixCall
) => {
  const url = new URL(`${TWITCH_ENDPOINTS.helix}${call.path}`)
  url.search = new URLSearchParams(call.query).toString()

  return platformRequest<T>({
    url: url.toString(),
    method: call.method,
    headers: helixHeaders(seat.accessToken),
    body: call.body,
    // Twitch counts points per user token
    bucket: `twitch:${seat.moderatorId}`,
  })
}

/**
 * Carry a gesture out on Twitch
 * @param {ModViewIntent} intent - Gesture
 * @param {TwitchSeat} seat - Who acts where
 * @return {Promise<void>} - Done
 */

export const performOnTwitch = async (intent: ModViewIntent, seat: TwitchSeat): Promise<void> => {
  // A blocked term is removed by its identifier
  let termId: string | undefined
  if (intent.kind === 'term' && intent.remove && intent.list === 'blocked') {
    const terms = await readBlockedTerms(seat)
    termId = terms.find((term) => term.text.toLowerCase() === intent.term.toLowerCase())?.id
    if (!termId) throw new PlatformError(404, 'term not found')
  }

  await runHelix(seat, helixCallOf(intent, seat, termId))
}

/**
 * Whether the seat's account moderates the channel
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<boolean>} - Moderates
 */

export const moderatesChannel = async (seat: TwitchSeat): Promise<boolean> => {
  if (seat.moderatorId === seat.broadcasterId) return true

  let cursor: string | undefined
  // Pages of moderated channels until found
  do {
    const answer = await runHelix<{
      data: { broadcaster_id: string }[]
      pagination?: { cursor?: string }
    }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.moderatedChannels,
      query: { user_id: seat.moderatorId, first: '100', ...(cursor ? { after: cursor } : {}) },
    })
    if (answer?.data.some((row) => row.broadcaster_id === seat.broadcasterId)) return true
    cursor = answer?.pagination?.cursor
  } while (cursor)

  return false
}

/**
 * Blocked terms of the channel
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<{ id: string, text: string }[]>} - Terms
 */

export const readBlockedTerms = async (
  seat: TwitchSeat
): Promise<{ id: string; text: string }[]> => {
  const answer = await runHelix<{ data: { id: string; text: string }[] }>(seat, {
    method: 'GET',
    path: HELIX_PATHS.blockedTerms,
    query: { broadcaster_id: seat.broadcasterId, moderator_id: seat.moderatorId, first: '100' },
  })

  return answer?.data ?? []
}

/**
 * Chat restrictions in force
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<ChatModes>} - Modes
 */

export const readChatModes = async (seat: TwitchSeat): Promise<ChatModes> => {
  const channel = { broadcaster_id: seat.broadcasterId, moderator_id: seat.moderatorId }
  const [settings, shield] = await Promise.all([
    runHelix<{
      data: {
        slow_mode: boolean
        slow_mode_wait_time: number | null
        follower_mode: boolean
        follower_mode_duration: number | null
        subscriber_mode: boolean
        emote_mode: boolean
      }[]
    }>(seat, { method: 'GET', path: HELIX_PATHS.chatSettings, query: channel }),
    runHelix<{ data: { is_active: boolean }[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.shieldMode,
      query: channel,
    }),
  ])
  const row = settings?.data[0]

  return {
    shield: shield?.data[0]?.is_active ?? false,
    subscribers: row?.subscriber_mode ?? false,
    followers: row?.follower_mode ?? false,
    followerMinutes: row?.follower_mode ? (row.follower_mode_duration ?? 0) : null,
    emotes: row?.emote_mode ?? false,
    slowSeconds: row?.slow_mode ? (row.slow_mode_wait_time ?? null) : null,
  }
}

/**
 * Pending unban requests
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<UnbanRequest[]>} - Requests
 */

export const readUnbanRequests = async (seat: TwitchSeat): Promise<UnbanRequest[]> => {
  type Row = {
    id: string
    user_id: string
    user_login: string
    user_name: string
    text: string
    created_at: string
  }
  const rows: Row[] = []
  let cursor: string | undefined

  // Pages of pending requests, as many as a busy channel stacks up
  for (let page = 0; page < MAX_REQUEST_PAGES; page += 1) {
    const answer = await runHelix<{ data: Row[]; pagination?: { cursor?: string } }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.unbanRequests,
      query: {
        broadcaster_id: seat.broadcasterId,
        moderator_id: seat.moderatorId,
        status: 'pending',
        first: '100',
        ...(cursor ? { after: cursor } : {}),
      },
    })
    rows.push(...(answer?.data ?? []))
    cursor = answer?.pagination?.cursor
    if (!cursor) break
  }

  return rows.map((row) => ({
    id: row.id,
    author: twitchChatter(row.user_id, row.user_login, row.user_name),
    text: row.text,
    at: row.created_at,
  }))
}

/**
 * Account and ban of one viewer, as the unban desk shows them
 * @param {TwitchSeat} seat - Seat
 * @param {string} userId - Viewer
 * @return {Promise<BanDetail>} - Detail, empty fields when Twitch has none
 */

export const readBanDetail = async (seat: TwitchSeat, userId: string): Promise<BanDetail> => {
  const [user, ban] = await Promise.all([
    runHelix<{ data: { profile_image_url?: string; created_at?: string }[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.users,
      query: { id: userId },
    }).catch(() => null),
    runHelix<{
      data: {
        created_at?: string
        reason?: string
        moderator_name?: string
        moderator_login?: string
      }[]
    }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.banned,
      query: { broadcaster_id: seat.broadcasterId, user_id: userId },
    }).catch(() => null),
  ])
  const account = user?.data[0]
  const entry = ban?.data[0]

  return {
    avatar: account?.profile_image_url || null,
    accountCreatedAt: account?.created_at ?? null,
    bannedBy: entry?.moderator_name || entry?.moderator_login || null,
    bannedAt: entry?.created_at ?? null,
    reason: entry?.reason || null,
  }
}

/**
 * Who sits in the chat
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<{ moderators: Chatter[], vips: Chatter[], viewers: Chatter[] }>} - Community
 */

export const readCommunity = async (
  seat: TwitchSeat
): Promise<{ moderators: Chatter[]; vips: Chatter[]; viewers: Chatter[] }> => {
  type Row = { user_id: string; user_login: string; user_name: string }
  const [chatters, moderators, vips] = await Promise.all([
    runHelix<{ data: Row[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.chatters,
      query: {
        broadcaster_id: seat.broadcasterId,
        moderator_id: seat.moderatorId,
        first: String(TWITCH_LIMITS.chattersPage),
      },
    }),
    runHelix<{ data: Row[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.moderators,
      query: { broadcaster_id: seat.broadcasterId, first: '100' },
    }).catch(() => null),
    runHelix<{ data: Row[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.vips,
      query: { broadcaster_id: seat.broadcasterId, first: '100' },
    }).catch(() => null),
  ])
  const moderatorIds = new Set((moderators?.data ?? []).map((row) => row.user_id))
  const vipIds = new Set((vips?.data ?? []).map((row) => row.user_id))
  const present = (chatters?.data ?? []).filter((row) => row.user_id !== seat.broadcasterId)

  // Only who is present
  return {
    moderators: present
      .filter((row) => moderatorIds.has(row.user_id))
      .map((row) => twitchChatter(row.user_id, row.user_login, row.user_name, ['moderator'])),
    vips: present
      .filter((row) => vipIds.has(row.user_id))
      .map((row) => twitchChatter(row.user_id, row.user_login, row.user_name, ['vip'])),
    viewers: present
      .filter((row) => !moderatorIds.has(row.user_id) && !vipIds.has(row.user_id))
      .map((row) => twitchChatter(row.user_id, row.user_login, row.user_name)),
  }
}

/**
 * Title and category of the stream
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<{ title: string, category: string | null, startedAt: string } | null>} - Stream
 */

export const readStream = async (
  seat: TwitchSeat
): Promise<{
  title: string
  category: string | null
  categoryId: string | null
  startedAt: string
  id: string
  viewers: number
} | null> => {
  const answer = await runHelix<{
    data: {
      id: string
      title: string
      game_id: string
      game_name: string
      started_at: string
      viewer_count: number
    }[]
  }>(seat, { method: 'GET', path: HELIX_PATHS.streams, query: { user_id: seat.broadcasterId } })
  const row = answer?.data[0]

  return row
    ? {
        id: row.id,
        title: row.title,
        category: row.game_name || null,
        categoryId: row.game_id || null,
        startedAt: row.started_at,
        viewers: row.viewer_count ?? 0,
      }
    : null
}

/**
 * Emotes of Twitch and of the channel, none locked yet
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<{ global: TwitchEmote[], channel: TwitchEmote[] }>} - Emotes, the channel's empty when Twitch refuses them
 */

export const readEmotes = async (
  seat: TwitchSeat
): Promise<{ global: TwitchEmote[]; channel: TwitchEmote[] }> => {
  type Row = { id: string; name: string; format?: string[]; emote_type?: string }
  const toEmote = (row: Row): TwitchEmote => ({
    id: row.id,
    name: row.name,
    animated: row.format?.includes('animated') ?? false,
    kind:
      row.emote_type === 'subscriptions' ||
      row.emote_type === 'bitstier' ||
      row.emote_type === 'follower'
        ? row.emote_type
        : null,
    isLocked: false,
  })
  const [global, channel] = await Promise.all([
    runHelix<{ data: Row[] }>(seat, { method: 'GET', path: HELIX_PATHS.emotesGlobal, query: {} }),
    runHelix<{ data: Row[] }>(seat, {
      method: 'GET',
      path: HELIX_PATHS.emotes,
      query: { broadcaster_id: seat.broadcasterId },
    }).catch(() => null),
  ])

  return {
    global: (global?.data ?? []).map(toEmote),
    channel: (channel?.data ?? []).map(toEmote),
  }
}

// Pages read of the pending unban requests
const MAX_REQUEST_PAGES = 5

// Pages read of the emotes a member owns
const MAX_EMOTE_PAGES = 10

/**
 * Identifiers of the emotes the seat's account may use on the channel
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<Set<string> | null>} - Identifiers, none when the link lacks the right to read them
 */

export const readOwnedEmoteIds = async (seat: TwitchSeat): Promise<Set<string> | null> => {
  const owned = new Set<string>()
  let cursor: string | undefined

  try {
    for (let page = 0; page < MAX_EMOTE_PAGES; page += 1) {
      const answer = await runHelix<{
        data: { id: string }[]
        pagination?: { cursor?: string }
      }>(seat, {
        method: 'GET',
        path: HELIX_PATHS.emotesUser,
        query: {
          user_id: seat.moderatorId,
          broadcaster_id: seat.broadcasterId,
          ...(cursor ? { after: cursor } : {}),
        },
      })
      answer?.data.forEach((row) => owned.add(row.id))
      cursor = answer?.pagination?.cursor
      if (!cursor) break
    }
  } catch (error) {
    // A link made before the right existed is simply not checked
    if (error instanceof PlatformError && [400, 401, 403].includes(error.status)) return null
    throw error
  }

  return owned
}

/**
 * Message pinned at the top of the chat
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<PinnedMessage | null>} - Pin, none when nothing is pinned
 */

export const readPin = async (seat: TwitchSeat): Promise<PinnedMessage | null> => {
  const answer = await runHelix<{
    data: {
      message_id: string
      sender_user_id: string
      sender_user_login: string
      sender_user_name: string
      pinned_by_user_name: string
      pinned_by_user_login: string
      message: { text: string; fragments?: unknown }
      ends_at: string | null
    }[]
  }>(seat, {
    method: 'GET',
    path: HELIX_PATHS.pins,
    query: { broadcaster_id: seat.broadcasterId, moderator_id: seat.moderatorId },
  })
  const row = answer?.data[0]
  if (!row) return null

  return {
    messageId: row.message_id,
    author: twitchChatter(row.sender_user_id, row.sender_user_login, row.sender_user_name),
    text: row.message.text,
    fragments: fragmentsOf(row.message.fragments, row.message.text),
    pinnedBy: row.pinned_by_user_name || row.pinned_by_user_login,
    endsAt: row.ends_at,
  }
}

/**
 * Tags the streamer gave the live
 * @param {TwitchSeat} seat - Seat
 * @return {Promise<string[]>} - Tags
 */

export const readChannelTags = async (seat: TwitchSeat): Promise<string[]> => {
  const answer = await runHelix<{ data: { tags?: string[] }[] }>(seat, {
    method: 'GET',
    path: HELIX_PATHS.channels,
    query: { broadcaster_id: seat.broadcasterId },
  })

  return answer?.data[0]?.tags ?? []
}

// Box art kept per category, it never changes
const boxArt = new Map<string, string | null>()

// Size asked of the box art, twice what the window draws
const BOX_ART_SIZE = '144x192'

/**
 * Cover picture of a category
 * @param {TwitchSeat} seat - Seat
 * @param {string} categoryId - Category identifier
 * @return {Promise<string | null>} - Picture address, none when Twitch has none
 */

export const readCategoryArt = async (
  seat: TwitchSeat,
  categoryId: string
): Promise<string | null> => {
  if (boxArt.has(categoryId)) return boxArt.get(categoryId) ?? null

  const answer = await runHelix<{ data: { box_art_url?: string }[] }>(seat, {
    method: 'GET',
    path: HELIX_PATHS.games,
    query: { id: categoryId },
  })
  const url = answer?.data[0]?.box_art_url?.replace('{width}x{height}', BOX_ART_SIZE) ?? null
  boxArt.set(categoryId, url)

  return url
}

/**
 * Build a chatter from Twitch fields
 * @param {string} id - User identifier
 * @param {string} login - Login
 * @param {string} name - Display name
 * @param {ChatBadge[]} [badges] - Badges
 * @param {string | null} [colour] - Name colour
 * @return {Chatter} - Chatter
 */

export const twitchChatter = (
  id: string,
  login: string,
  name: string,
  badges: ChatBadge[] = [],
  colour: string | null = null
): Chatter => ({ id, login, name: name || login, colour: colour || null, badges })
