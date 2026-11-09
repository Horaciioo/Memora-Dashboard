import {
  banUser,
  deleteMessage,
  FakeRefusal,
  fragmentsOf,
  postMessage,
  TWITCH_EMOTES,
  unbanUser,
  warnUser,
} from './effects.ts'
import {
  changeTerm,
  resolveHeld,
  resolveUnbanRequest,
  setShield,
  settingsRow,
  updateSettings,
} from './channelEffects.ts'
import type { SettingsPatch } from './channelEffects.ts'
import { subscribe } from './eventsub.ts'
import type { FakeUser } from './identities.ts'
import {
  allChannels,
  allViewers,
  channelOf,
  isModerator,
  teamModerators,
  userById,
  userByLogin,
} from './world.ts'
import type { Channel } from './world.ts'

/**
 * One Helix request
 * @typedef {Object} HelixRequest
 */

export interface HelixRequest {
  user: FakeUser | null
  query: URLSearchParams
  body: Record<string, unknown>
}

/**
 * One Helix answer
 * @typedef {Object} HelixAnswer
 */

export interface HelixAnswer {
  status: number
  body?: unknown
}

type Handler = (request: HelixRequest) => HelixAnswer

// Channel emotes of the fake streamer, borrowing real pictures
const FAKE_CHANNEL_EMOTES = [
  { id: '25', name: 'FauxHype', type: 'subscriptions', owned: true },
  { id: '425618', name: 'FauxLOL', type: 'subscriptions', owned: false },
  { id: '41', name: 'FauxBits', type: 'bitstier', owned: false },
  { id: '354', name: 'FauxFollow', type: 'follower', owned: true },
] as const

// Read a text field
const textOf = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

/**
 * User row as Helix shows it
 * @param {FakeUser} user - User
 * @return {Record<string, string>} - Row
 */

const userRow = (user: FakeUser): Record<string, string> => ({
  user_id: user.id,
  user_login: user.login,
  user_name: user.name,
})

/**
 * Moderator acting on a channel
 * @param {HelixRequest} request - Request
 * @return {{ channel: Channel, moderator: FakeUser }} - Seat
 */

const seatOf = (request: HelixRequest): { channel: Channel; moderator: FakeUser } => {
  const moderator = request.user
  if (!moderator) throw new FakeRefusal(401, 'Invalid OAuth token')

  const moderatorId = request.query.get('moderator_id') ?? moderator.id
  if (moderatorId !== moderator.id) {
    throw new FakeRefusal(
      403,
      'The ID in moderator_id must match the user ID in the user access token.'
    )
  }

  const channel = channelOf(request.query.get('broadcaster_id') ?? '')
  if (!isModerator(moderator.id) && moderator.id !== channel.broadcaster.id) {
    throw new FakeRefusal(
      403,
      'The user in moderator_id is not one of the broadcaster’s moderators.'
    )
  }

  return { channel, moderator }
}

/**
 * Target of a ban body
 * @param {Record<string, unknown>} body - Body
 * @return {{ target: FakeUser, detail: Record<string, unknown> }} - Target
 */

const targetOf = (body: Record<string, unknown>) => {
  const detail = (body.data ?? {}) as Record<string, unknown>
  const target = userById(textOf(detail.user_id, ''))
  if (!target) throw new FakeRefusal(400, 'The user_id field is not valid.')

  return { target, detail }
}

/**
 * Open an EventSub subscription
 * @param {HelixRequest} request - Request
 * @return {HelixAnswer} - Answer
 */

const createSubscription: Handler = (request) => {
  const user = request.user
  if (!user) throw new FakeRefusal(401, 'Invalid OAuth token')

  const condition = (request.body.condition ?? {}) as Record<string, string>
  const holder = condition.moderator_user_id ?? condition.user_id
  if (holder && holder !== user.id)
    throw new FakeRefusal(403, 'subscription missing proper authorization')
  if (condition.moderator_user_id && !isModerator(user.id)) {
    throw new FakeRefusal(403, 'subscription missing proper authorization')
  }

  const transport = (request.body.transport ?? {}) as Record<string, string>
  const created = subscribe(transport.session_id ?? '', {
    type: textOf(request.body.type, ''),
    version: textOf(request.body.version, '1'),
    condition,
  })
  if (!created)
    throw new FakeRefusal(
      400,
      'websocket transport session does not exist or has already disconnected'
    )

  return {
    status: 202,
    body: {
      data: [{ ...created, status: 'enabled', cost: 0, transport, created_at: created.createdAt }],
      total: 1,
      total_cost: 0,
      max_total_cost: 10,
    },
  }
}

/**
 * Users by token, login or identifier
 * @param {HelixRequest} request - Request
 * @return {HelixAnswer} - Answer
 */

const readUsers: Handler = (request) => {
  const logins = request.query.getAll('login').map(userByLogin)
  const ids = request.query.getAll('id').flatMap((id) => userById(id) ?? [])
  const found = [...logins, ...ids]
  const fromToken = request.user ? [request.user] : []
  const users = found.length > 0 ? found : fromToken

  return {
    status: 200,
    body: {
      data: users.map((user) => ({
        id: user.id,
        login: user.login,
        display_name: user.name,
        type: '',
        broadcaster_type: '',
        description: 'Compte de démonstration du faux live',
        profile_image_url: '',
        created_at: '2020-01-01T00:00:00Z',
      })),
    },
  }
}

/**
 * Stream of a channel
 * @param {HelixRequest} request - Request
 * @return {HelixAnswer} - Answer
 */

const readStreams: Handler = (request) => {
  const channel = channelOf(request.query.get('user_id') ?? '')
  const stream = channel.stream

  return {
    status: 200,
    body: {
      data: stream
        ? [
            {
              id: stream.id,
              ...userRow(channel.broadcaster),
              game_id: '509658',
              game_name: channel.category,
              type: 'live',
              title: channel.title,
              viewer_count: channel.viewers,
              started_at: stream.startedAt,
              language: 'fr',
              thumbnail_url: '',
              tags: ['Français'],
              is_mature: false,
            },
          ]
        : [],
      pagination: {},
    },
  }
}

/**
 * Channels the token's user moderates
 * @param {HelixRequest} request - Request
 * @return {HelixAnswer} - Answer
 */

const readModeratedChannels: Handler = (request) => ({
  status: 200,
  body: {
    data:
      request.user && isModerator(request.user.id)
        ? allChannels().map((channel) => ({
            broadcaster_id: channel.broadcaster.id,
            broadcaster_login: channel.broadcaster.login,
            broadcaster_name: channel.broadcaster.name,
          }))
        : [],
    pagination: {},
  },
})

/**
 * Viewers and moderators in the chat
 * @param {HelixRequest} request - Request
 * @return {HelixAnswer} - Answer
 */

const readChatters: Handler = (request) => {
  const { channel } = seatOf(request)
  const present = channel.stream ? [...teamModerators(), ...allViewers()] : []

  return {
    status: 200,
    body: { data: present.map(userRow), pagination: {}, total: present.length },
  }
}

/**
 * Rows of a badge set
 * @param {string} badge - Badge set
 * @return {Handler} - Handler
 */

const readBadgeHolders =
  (badge: string): Handler =>
  () => {
    const holders =
      badge === 'moderator'
        ? teamModerators()
        : allViewers().filter((viewer) => viewer.badges.includes(badge))

    return { status: 200, body: { data: holders.map(userRow), pagination: {} } }
  }

/**
 * Helix routes, by verb and path
 * @type {Record<string, Handler>}
 */

export const HELIX_ROUTES: Record<string, Handler> = {
  'GET /users': readUsers,
  'GET /streams': readStreams,
  'GET /moderation/channels': readModeratedChannels,
  'GET /chat/chatters': readChatters,
  'GET /moderation/moderators': readBadgeHolders('moderator'),
  'GET /channels/vips': readBadgeHolders('vip'),
  'POST /eventsub/subscriptions': createSubscription,
  'POST /moderation/bans': (request) => {
    const { channel, moderator } = seatOf(request)
    const { target, detail } = targetOf(request.body)
    const seconds = Number(detail.duration) || null
    banUser(channel, moderator, target, { seconds, reason: textOf(detail.reason, '') })

    return {
      status: 200,
      body: { data: [{ broadcaster_id: channel.broadcaster.id, user_id: target.id }] },
    }
  },
  'DELETE /moderation/bans': (request) => {
    const { channel, moderator } = seatOf(request)
    const target = userById(request.query.get('user_id') ?? '')
    if (!target) throw new FakeRefusal(400, 'The user_id field is not valid.')
    unbanUser(channel, moderator, target)

    return { status: 204 }
  },
  'DELETE /moderation/chat': (request) => {
    const { channel, moderator } = seatOf(request)
    deleteMessage(channel, moderator, request.query.get('message_id') ?? '')

    return { status: 204 }
  },
  'POST /moderation/warnings': (request) => {
    const { channel, moderator } = seatOf(request)
    const { target, detail } = targetOf(request.body)
    warnUser(channel, moderator, target, textOf(detail.reason, ''))

    return {
      status: 200,
      body: { data: [{ broadcaster_id: channel.broadcaster.id, user_id: target.id }] },
    }
  },
  'GET /chat/settings': (request) => ({
    status: 200,
    body: { data: [settingsRow(seatOf(request).channel)] },
  }),
  'PATCH /chat/settings': (request) => {
    const { channel, moderator } = seatOf(request)
    updateSettings(channel, moderator, request.body as SettingsPatch)

    return { status: 200, body: { data: [settingsRow(channel)] } }
  },
  'GET /moderation/shield_mode': (request) => ({
    status: 200,
    body: { data: [{ is_active: seatOf(request).channel.shield }] },
  }),
  'PUT /moderation/shield_mode': (request) => {
    const { channel, moderator } = seatOf(request)
    setShield(channel, moderator, request.body.is_active === true)

    return { status: 200, body: { data: [{ is_active: channel.shield }] } }
  },
  'GET /moderation/blocked_terms': (request) => ({
    status: 200,
    body: {
      data: [...seatOf(request).channel.terms].map(([id, text]) => ({ id, text })),
      pagination: {},
    },
  }),
  'POST /moderation/blocked_terms': (request) => {
    const { channel, moderator } = seatOf(request)
    const text = textOf(request.body.text, '')
    const id = changeTerm(channel, moderator, { text, isAdd: true })

    return { status: 200, body: { data: [{ id, text }] } }
  },
  'DELETE /moderation/blocked_terms': (request) => {
    const { channel, moderator } = seatOf(request)
    const text = channel.terms.get(request.query.get('id') ?? '')
    if (!text) throw new FakeRefusal(404, 'The blocked term was not found.')
    changeTerm(channel, moderator, { text, isAdd: false })

    return { status: 204 }
  },
  'POST /moderation/automod/message': (request) => {
    const moderator = request.user
    if (!moderator) throw new FakeRefusal(401, 'Invalid OAuth token')
    const messageId = textOf(request.body.msg_id, '')
    const channel = allChannels().find((entry) => entry.held.has(messageId))
    if (!channel) throw new FakeRefusal(404, 'The message specified in msg_id was not found.')
    resolveHeld(channel, moderator, { messageId, approve: request.body.action === 'ALLOW' })

    return { status: 204 }
  },
  'POST /chat/messages': (request) => {
    const sender = request.user
    if (!sender) throw new FakeRefusal(401, 'Invalid OAuth token')
    const channel = channelOf(textOf(request.body.broadcaster_id, ''))
    const message = postMessage(
      channel,
      sender,
      textOf(request.body.message, ''),
      textOf(request.body.reply_parent_message_id, '') || null
    )

    return {
      status: 200,
      body: { data: [{ message_id: message.id, is_sent: true, drop_reason: null }] },
    }
  },
  'GET /channels': (request) => {
    const channel = channelOf(request.query.get('broadcaster_id') ?? '')

    return {
      status: 200,
      body: {
        data: [
          {
            broadcaster_id: channel.broadcaster.id,
            title: channel.title,
            game_name: channel.category,
            broadcaster_language: 'fr',
            tags: ['Français', 'FauxLive', 'Chill'],
            content_classification_labels: [],
          },
        ],
      },
    }
  },
  'GET /moderation/banned': (request) => {
    const { channel } = seatOf(request)
    const user = userById(request.query.get('user_id') ?? '')
    const isBanned = user !== null && channel.bans.has(user.id)

    return {
      status: 200,
      body: {
        data:
          user && isBanned
            ? [
                {
                  user_id: user.id,
                  user_login: user.login,
                  user_name: user.name,
                  expires_at: '',
                  created_at: new Date().toISOString(),
                  reason: 'Faux bannissement',
                  moderator_id: '0',
                  moderator_login: 'faux_modo',
                  moderator_name: 'Faux_Modo',
                },
              ]
            : [],
        pagination: {},
      },
    }
  },
  'GET /games': (request) => ({
    status: 200,
    body: {
      data: request.query.getAll('id').map((id) => ({
        id,
        name: 'Just Chatting',
        box_art_url: `https://static-cdn.jtvnw.net/ttv-boxart/${id}-{width}x{height}.jpg`,
      })),
    },
  }),
  'GET /chat/emotes/global': () => ({
    status: 200,
    body: {
      data: Object.entries(TWITCH_EMOTES).map(([name, id]) => ({
        id,
        name,
        format: ['static'],
        scale: ['1.0', '2.0', '3.0'],
        theme_mode: ['dark'],
      })),
    },
  }),
  'GET /chat/emotes': () => ({
    status: 200,
    body: {
      data: FAKE_CHANNEL_EMOTES.map((emote) => ({
        id: emote.id,
        name: emote.name,
        emote_type: emote.type,
        format: ['static'],
        scale: ['1.0', '2.0', '3.0'],
        theme_mode: ['dark'],
      })),
    },
  }),
  // The operator owns the first tier and every global
  'GET /chat/emotes/user': () => ({
    status: 200,
    body: {
      data: [
        ...Object.values(TWITCH_EMOTES).map((id) => ({ id })),
        ...FAKE_CHANNEL_EMOTES.filter((emote) => emote.owned).map((emote) => ({ id: emote.id })),
      ],
      pagination: {},
    },
  }),
  'GET /chat/pins': (request) => {
    const { channel } = seatOf(request)
    const pin = channel.pin
    // An expired pin lets go by itself
    if (pin?.endsAt && pin.endsAt < Date.now()) channel.pin = null
    if (!channel.pin) return { status: 200, body: { data: [] } }

    return {
      status: 200,
      body: {
        data: [
          {
            message_id: channel.pin.message.id,
            broadcaster_id: channel.broadcaster.id,
            sender_user_id: channel.pin.message.author.id,
            sender_user_login: channel.pin.message.author.login,
            sender_user_name: channel.pin.message.author.name,
            pinned_by_user_id: channel.pin.by.id,
            pinned_by_user_login: channel.pin.by.login,
            pinned_by_user_name: channel.pin.by.name,
            message: {
              text: channel.pin.message.text,
              fragments: fragmentsOf(channel.pin.message.text),
            },
            starts_at: new Date().toISOString(),
            ends_at: channel.pin.endsAt ? new Date(channel.pin.endsAt).toISOString() : null,
            updated_at: new Date().toISOString(),
          },
        ],
      },
    }
  },
  'PUT /chat/pins': (request) => {
    const { channel, moderator } = seatOf(request)
    const message = channel.messages.find((entry) => entry.id === request.query.get('message_id'))
    if (!message)
      throw new FakeRefusal(404, 'The message specified in the message_id was not found.')
    const seconds = Number(request.query.get('duration_seconds')) || null
    channel.pin = {
      message,
      by: moderator,
      endsAt: seconds ? Date.now() + seconds * 1000 : null,
    }

    return { status: 204 }
  },
  'DELETE /chat/pins': (request) => {
    const { channel } = seatOf(request)
    if (!channel.pin) throw new FakeRefusal(404, 'No message is pinned.')
    channel.pin = null

    return { status: 204 }
  },
  'GET /moderation/unban_requests': (request) => ({
    status: 200,
    body: {
      data: [...seatOf(request).channel.unbanRequests.values()].map((entry) => ({
        id: entry.id,
        ...userRow(entry.user),
        text: entry.text,
        created_at: entry.at,
        status: 'pending',
      })),
      pagination: {},
    },
  }),
  'PATCH /moderation/unban_requests': (request) => {
    const { channel, moderator } = seatOf(request)
    const row = resolveUnbanRequest(channel, moderator, {
      requestId: request.query.get('unban_request_id') ?? '',
      approve: request.query.get('status') === 'approved',
    })

    return { status: 200, body: { data: [row] } }
  },
}
