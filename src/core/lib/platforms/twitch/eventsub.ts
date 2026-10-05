import type { SceneEvent } from '@/core/lib/modview/scene'
import { twitchChatter } from '@/core/lib/platforms/twitch/helix'
import { TWITCH_EVENT_COPY } from '@/declarations/platforms/copy'
import type { ChatBadge, ModAct, ModActKind } from '@/types/modview'

/**
 * What one notification means for Memora
 * @typedef {Object} TwitchSignal
 */

export type TwitchSignal =
  | { kind: 'scene'; event: SceneEvent }
  | { kind: 'online'; streamId: string; startedAt: string }
  | { kind: 'offline' }

// Loose payload
type Payload = Record<string, unknown>

// Badge sets Memora draws
const BADGES: Record<string, ChatBadge> = {
  broadcaster: 'broadcaster',
  moderator: 'moderator',
  vip: 'vip',
  subscriber: 'subscriber',
  founder: 'subscriber',
}

// Chat setting actions of channel.moderate
const MODE_ACTIONS = new Set([
  'slow',
  'slowoff',
  'followers',
  'followersoff',
  'subscribers',
  'subscribersoff',
  'emoteonly',
  'emoteonlyoff',
])

/**
 * Read a string field
 * @param {unknown} value - Raw value
 * @return {string} - String
 */

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * Read a nested object
 * @param {Payload} payload - Parent
 * @param {string} key - Field
 * @return {Payload} - Child
 */

const child = (payload: Payload, key: string): Payload => {
  const value = payload[key]

  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Payload) : {}
}

/**
 * Read a user of a payload
 * @param {Payload} payload - Payload
 * @param {string} prefix - Field prefix
 * @return {{ id: string, login: string, name: string }} - User
 */

const userOf = (payload: Payload, prefix: string) => ({
  id: text(payload[`${prefix}_id`]),
  login: text(payload[`${prefix}_login`]),
  name: text(payload[`${prefix}_name`]),
})

/**
 * Words a boundary list points at
 * @param {string} message - Message text
 * @param {unknown} boundaries - Boundaries
 * @return {string[]} - Words
 */

const wordsAt = (message: string, boundaries: unknown): string[] =>
  Array.isArray(boundaries)
    ? boundaries.flatMap((entry) => {
        const boundary = (entry as Payload).boundary
          ? child(entry as Payload, 'boundary')
          : (entry as Payload)
        const start = Number(boundary.start_pos)
        const end = Number(boundary.end_pos)

        return Number.isFinite(start) && Number.isFinite(end) ? [message.slice(start, end + 1)] : []
      })
    : []

/**
 * Build a moderation act line
 * @param {string} id - Line identifier
 * @param {ModActKind} kind - Act
 * @param {Payload} event - Notification event
 * @param {string} at - When
 * @param {Partial<ModAct>} [extra] - Target
 * @return {ModAct} - Act
 */

const actOf = (
  id: string,
  kind: ModActKind,
  event: Payload,
  at: string,
  extra: Partial<ModAct> = {}
): ModAct => ({
  id,
  kind,
  target: null,
  moderator: text(event.moderator_user_name) || text(event.moderator_user_login),
  at,
  ...extra,
})

/**
 * Translate a channel.moderate notification
 * @param {Payload} event - Event
 * @param {string} id - Notification identifier
 * @param {string} at - When
 * @return {TwitchSignal[]} - Signals
 */

const moderateSignals = (event: Payload, id: string, at: string): TwitchSignal[] => {
  const action = text(event.action)
  const scene = (sceneEvent: SceneEvent): TwitchSignal => ({ kind: 'scene', event: sceneEvent })

  switch (action) {
    case 'ban':
    case 'timeout': {
      const detail = child(event, action)
      const target = userOf(detail, 'user')
      const expiresAt = Date.parse(text(detail.expires_at))

      return [
        scene({
          kind: 'act',
          act: actOf(id, action, event, at, {
            target: target.name || target.login,
            reason: text(detail.reason) || null,
            durationSeconds: Number.isFinite(expiresAt)
              ? Math.max(1, Math.round((expiresAt - Date.parse(at)) / 1000))
              : null,
          }),
        }),
      ]
    }
    case 'unban':
    case 'untimeout': {
      const target = userOf(child(event, action), 'user')

      return [
        scene({
          kind: 'act',
          act: actOf(id, 'unban', event, at, { target: target.name || target.login }),
        }),
      ]
    }
    case 'delete': {
      const detail = child(event, 'delete')
      const target = userOf(detail, 'user')

      return [
        scene({
          kind: 'act',
          act: actOf(id, 'delete', event, at, {
            target: target.name || target.login,
            quote: text(detail.message_body) || null,
          }),
          deleteMessageId: text(detail.message_id),
        }),
      ]
    }
    case 'warn': {
      const detail = child(event, 'warn')
      const target = userOf(detail, 'user')

      return [
        scene({
          kind: 'act',
          act: actOf(id, 'warn', event, at, {
            target: target.name || target.login,
            reason: text(detail.reason) || null,
          }),
        }),
      ]
    }
    case 'automod_terms': {
      const detail = child(event, 'automod_terms')
      const terms = Array.isArray(detail.terms) ? detail.terms.map(text).filter(Boolean) : []
      const isAdd = text(detail.action) === 'add'
      const list = text(detail.list) === 'permitted' ? 'allowed' : 'blocked'

      return [
        scene({ kind: 'terms', list, add: isAdd ? terms : [], remove: isAdd ? [] : terms }),
        scene({
          kind: 'act',
          act: actOf(id, isAdd ? 'termAdd' : 'termRemove', event, at, { quote: terms.join(', ') }),
        }),
      ]
    }
    case 'unban_request': {
      const detail = child(event, 'unban_request')
      const target = userOf(detail, 'user')

      return [
        scene({
          kind: 'act',
          act: actOf(id, 'unbanRequest', event, at, {
            target: target.name || target.login,
            reason: text(detail.moderator_message) || null,
          }),
        }),
      ]
    }
    default:
      if (!MODE_ACTIONS.has(action)) return []

      return [
        scene({
          kind: 'act',
          act: actOf(id, 'mode', event, at, {
            quote: TWITCH_EVENT_COPY.modeActions[action] ?? action,
          }),
        }),
      ]
  }
}

/**
 * Translate one EventSub notification into what the Mod View and the live need
 * @param {string} type - Subscription type
 * @param {Payload} event - Event payload
 * @param {Object} meta - Notification metadata
 * @param {string} meta.id - Message identifier
 * @param {string} meta.at - Message timestamp
 * @return {TwitchSignal[]} - Signals
 */

export const translateTwitchEvent = (
  type: string,
  event: Payload,
  meta: { id: string; at: string }
): TwitchSignal[] => {
  const scene = (sceneEvent: SceneEvent): TwitchSignal => ({ kind: 'scene', event: sceneEvent })

  switch (type) {
    case 'channel.chat.message': {
      const chatter = userOf(event, 'chatter_user')
      const badges = Array.isArray(event.badges)
        ? event.badges.flatMap((badge) => {
            const mapped = BADGES[text((badge as Payload).set_id)]

            return mapped ? [mapped] : []
          })
        : []

      return [
        scene({
          kind: 'message',
          message: {
            id: text(event.message_id),
            author: twitchChatter(
              chatter.id,
              chatter.login,
              chatter.name,
              [...new Set(badges)],
              text(event.color)
            ),
            text: text(child(event, 'message').text),
            sentAt: meta.at,
          },
        }),
      ]
    }
    case 'channel.chat.message_delete':
      return [
        scene({
          kind: 'strike',
          by: TWITCH_EVENT_COPY.twitch,
          messageIds: [text(event.message_id)],
        }),
      ]
    case 'channel.chat.clear_user_messages':
      return [
        scene({
          kind: 'strike',
          by: TWITCH_EVENT_COPY.twitch,
          chatterId: text(event.target_user_id),
        }),
      ]
    case 'channel.chat_settings.update':
      return [
        scene({
          kind: 'modes',
          modes: {
            subscribers: event.subscriber_mode === true,
            followers: event.follower_mode === true,
            emotes: event.emote_mode === true,
            slowSeconds:
              event.slow_mode === true ? Number(event.slow_mode_wait_time_seconds) || null : null,
          },
        }),
      ]
    case 'channel.shield_mode.begin':
    case 'channel.shield_mode.end':
      return [scene({ kind: 'modes', modes: { shield: type === 'channel.shield_mode.begin' } })]
    case 'channel.moderate':
      return moderateSignals(event, meta.id, meta.at)
    case 'automod.message.hold': {
      const author = userOf(event, 'user')
      const message = text(child(event, 'message').text)
      const automod = child(event, 'automod')
      const isTerm = text(event.reason) === 'blocked_term'
      const flagged = isTerm
        ? wordsAt(message, child(event, 'blocked_term').terms_found)
        : wordsAt(message, automod.boundaries)

      return [
        scene({
          kind: 'hold',
          held: {
            id: text(event.message_id),
            author: twitchChatter(author.id, author.login, author.name),
            text: message,
            flagged,
            category: isTerm
              ? TWITCH_EVENT_COPY.blockedTerm
              : (TWITCH_EVENT_COPY.automodCategories[text(automod.category)] ??
                text(automod.category)),
            at: text(event.held_at) || meta.at,
          },
        }),
      ]
    }
    case 'automod.message.update': {
      const status = text(event.status)
      const author = userOf(event, 'user')

      return [
        scene({ kind: 'release', heldId: text(event.message_id) }),
        ...(status === 'Approved' || status === 'Denied'
          ? [
              scene({
                kind: 'act',
                act: actOf(
                  meta.id,
                  status === 'Approved' ? 'automodApprove' : 'automodDeny',
                  event,
                  meta.at,
                  {
                    target: author.name || author.login,
                    quote: text(child(event, 'message').text) || null,
                  }
                ),
              }),
            ]
          : []),
      ]
    }
    case 'channel.unban_request.create': {
      const author = userOf(event, 'user')

      return [
        scene({
          kind: 'unbanRequest',
          request: {
            id: text(event.id),
            author: twitchChatter(author.id, author.login, author.name),
            text: text(event.text),
            at: text(event.created_at) || meta.at,
          },
        }),
      ]
    }
    case 'channel.unban_request.resolve':
      return [scene({ kind: 'unbanResolved', requestId: text(event.id) })]
    case 'stream.online':
      return [
        { kind: 'online', streamId: text(event.id), startedAt: text(event.started_at) || meta.at },
      ]
    case 'stream.offline':
      return [{ kind: 'offline' }]
    default:
      return []
  }
}
