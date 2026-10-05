import { PlatformError, platformRequest } from '@/core/lib/platforms/http'
import { helixHeaders } from '@/core/lib/platforms/twitch/oauth'
import { HELIX_PATHS, TWITCH_ENDPOINTS, TWITCH_LIMITS } from '@/declarations/platforms/twitch'
import type { ChatBadge, ChatModes, Chatter, ModViewIntent, UnbanRequest } from '@/types/modview'

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
        },
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
        ...(intent.enabled ? { follower_mode_duration: 0 } : {}),
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
  const answer = await runHelix<{
    data: {
      id: string
      user_id: string
      user_login: string
      user_name: string
      text: string
      created_at: string
    }[]
  }>(seat, {
    method: 'GET',
    path: HELIX_PATHS.unbanRequests,
    query: {
      broadcaster_id: seat.broadcasterId,
      moderator_id: seat.moderatorId,
      status: 'pending',
    },
  })

  return (answer?.data ?? []).map((row) => ({
    id: row.id,
    author: twitchChatter(row.user_id, row.user_login, row.user_name),
    text: row.text,
    at: row.created_at,
  }))
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
): Promise<{ title: string; category: string | null; startedAt: string; id: string } | null> => {
  const answer = await runHelix<{
    data: { id: string; title: string; game_name: string; started_at: string }[]
  }>(seat, { method: 'GET', path: HELIX_PATHS.streams, query: { user_id: seat.broadcasterId } })
  const row = answer?.data[0]

  return row
    ? { id: row.id, title: row.title, category: row.game_name || null, startedAt: row.started_at }
    : null
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
