import type { ModerationKind } from '@prisma/client'

/**
 * One moderation gesture as Twitch reports it, for the log
 * @typedef {Object} PlatformLogEntry
 */

export interface PlatformLogEntry {
  kind: ModerationKind
  externalEventId: string
  actorPlatformUserId: string | null
  actorLogin: string | null
  targetPlatformUserId: string | null
  targetLogin: string | null
  durationSeconds: number | null
  reason: string | null
  messageExcerpt: string | null
  occurredAt: string
}

// Loose payload, every field checked before use
type Payload = Record<string, unknown>

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

// Read a string field
const text = (value: unknown): string | null => (typeof value === 'string' && value ? value : null)

// Read a nested object
const child = (payload: Payload, key: string): Payload => {
  const value = payload[key]

  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Payload) : {}
}

/**
 * Kind of a channel.moderate action, none for an unlogged one
 * @param {string} action - Twitch action
 * @param {Payload} event - Event
 * @return {ModerationKind | null} - Kind
 */

const kindOf = (action: string, event: Payload): ModerationKind | null => {
  switch (action) {
    case 'ban':
      return 'BAN'
    case 'timeout':
      return 'TIMEOUT'
    case 'unban':
    case 'untimeout':
      return 'UNBAN'
    case 'delete':
      return 'DELETE'
    case 'warn':
      return 'WARN'
    case 'automod_terms':
      return text(child(event, 'automod_terms').action) === 'add' ? 'TERM_ADD' : 'TERM_REMOVE'
    case 'unban_request':
      return child(event, 'unban_request').is_approved === true
        ? 'UNBAN_REQUEST_APPROVE'
        : 'UNBAN_REQUEST_DENY'
    default:
      return MODE_ACTIONS.has(action) ? 'MODE_CHANGE' : null
  }
}

/**
 * Read a log line out of an EventSub notification, none for what is not a gesture
 * @param {string} type - Subscription type
 * @param {Payload} event - Event
 * @param {{ id: string, at: string }} meta - Notification identifier and time
 * @return {PlatformLogEntry | null} - Entry
 */

export const logEntryOf = (
  type: string,
  event: Payload,
  meta: { id: string; at: string }
): PlatformLogEntry | null => {
  const actor = {
    actorPlatformUserId: text(event.moderator_user_id),
    actorLogin: text(event.moderator_user_login),
  }

  if (type === 'automod.message.update') {
    const status = text(event.status)
    if (status !== 'Approved' && status !== 'Denied') return null

    return {
      kind: status === 'Approved' ? 'AUTOMOD_APPROVE' : 'AUTOMOD_DENY',
      externalEventId: meta.id,
      ...actor,
      targetPlatformUserId: text(event.user_id),
      targetLogin: text(event.user_login),
      durationSeconds: null,
      reason: null,
      messageExcerpt: text(child(event, 'message').text),
      occurredAt: meta.at,
    }
  }

  if (type !== 'channel.moderate') return null

  const action = text(event.action) ?? ''
  const kind = kindOf(action, event)
  if (!kind) return null

  const detail = child(event, action)
  const expiresAt = Date.parse(text(detail.expires_at) ?? '')
  const terms = Array.isArray(detail.terms)
    ? detail.terms.filter((term) => typeof term === 'string')
    : []

  return {
    kind,
    externalEventId: meta.id,
    ...actor,
    targetPlatformUserId: text(detail.user_id),
    targetLogin: text(detail.user_login),
    durationSeconds: Number.isFinite(expiresAt)
      ? Math.max(1, Math.round((expiresAt - Date.parse(meta.at)) / 1000))
      : action === 'slow'
        ? Number(detail.wait_time_seconds) || null
        : null,
    reason: text(detail.reason) ?? text(detail.moderator_message),
    messageExcerpt: text(detail.message_body) ?? (terms.length ? terms.join(', ') : action),
    occurredAt: meta.at,
  }
}
