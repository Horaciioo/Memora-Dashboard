import { POLL_LIMITS } from '@/declarations/modview/polls'
import { CHAT_MODES } from '@/declarations/modview/registries'
import type { ChatModeName, ModViewIntent } from '@/types/modview'

// Longest text a gesture carries
const MAX_TEXT = 500

/**
 * Read a bounded string
 * @param {unknown} value - Raw value
 * @param {boolean} [required] - Must not be empty
 * @return {string | null} - Text
 */

const textOf = (value: unknown, required = true): string | null => {
  if (typeof value !== 'string') return required ? null : ''
  const trimmed = value.trim().slice(0, MAX_TEXT)

  return required && trimmed.length === 0 ? null : trimmed
}

/**
 * Read a poll sent by the browser
 * @param {Record<string, unknown>} raw - Body
 * @return {ModViewIntent | null} - Poll
 */

const readPoll = (raw: Record<string, unknown>): ModViewIntent | null => {
  const title = textOf(raw.title)?.slice(0, POLL_LIMITS.titleLength)
  const seconds = Number(raw.seconds)
  const choices = Array.isArray(raw.choices)
    ? raw.choices.flatMap((entry) => textOf(entry)?.slice(0, POLL_LIMITS.choiceLength) ?? [])
    : []
  const fits =
    choices.length >= POLL_LIMITS.minChoices &&
    choices.length <= POLL_LIMITS.maxChoices &&
    Number.isInteger(seconds) &&
    seconds >= POLL_LIMITS.minSeconds &&
    seconds <= POLL_LIMITS.maxSeconds
  if (!title || !fits) return null

  const points = Number(raw.points)
  const hasPoints =
    Number.isInteger(points) && points >= POLL_LIMITS.minPoints && points <= POLL_LIMITS.maxPoints

  return { kind: 'poll', title, choices, seconds, ...(hasPoints ? { points } : {}) }
}

/**
 * Read a gesture sent by the browser
 * @param {Record<string, unknown>} raw - Body
 * @return {ModViewIntent | null} - Gesture
 */

export const readIntent = (raw: Record<string, unknown>): ModViewIntent | null => {
  const chatterId = textOf(raw.chatterId)

  switch (raw.kind) {
    case 'delete': {
      const messageId = textOf(raw.messageId)
      return messageId && chatterId ? { kind: 'delete', messageId, chatterId } : null
    }
    case 'warn': {
      const reason = textOf(raw.reason)
      const messageId = textOf(raw.messageId, false)
      return chatterId && reason
        ? { kind: 'warn', chatterId, reason, ...(messageId ? { messageId } : {}) }
        : null
    }
    case 'timeout': {
      const seconds = Number(raw.seconds)
      return chatterId && Number.isInteger(seconds) && seconds > 0
        ? { kind: 'timeout', chatterId, seconds, reason: textOf(raw.reason, false) || null }
        : null
    }
    case 'ban':
      return chatterId
        ? { kind: 'ban', chatterId, reason: textOf(raw.reason, false) || null }
        : null
    case 'unban':
      return chatterId ? { kind: 'unban', chatterId } : null
    case 'automod': {
      const heldId = textOf(raw.heldId)
      return heldId && typeof raw.approve === 'boolean'
        ? { kind: 'automod', heldId, approve: raw.approve }
        : null
    }
    case 'unbanRequest': {
      const requestId = textOf(raw.requestId)
      return requestId && typeof raw.approve === 'boolean'
        ? { kind: 'unbanRequest', requestId, approve: raw.approve }
        : null
    }
    case 'mode': {
      const mode = String(raw.mode)
      if (!CHAT_MODES.has(mode) || typeof raw.enabled !== 'boolean') return null
      const seconds = raw.seconds === undefined ? undefined : Number(raw.seconds)

      return {
        kind: 'mode',
        mode: mode as ChatModeName,
        enabled: raw.enabled,
        ...(seconds !== undefined && Number.isInteger(seconds) ? { seconds } : {}),
      }
    }
    case 'term': {
      const term = textOf(raw.term)
      const list = raw.list === 'allowed' ? 'allowed' : raw.list === 'blocked' ? 'blocked' : null
      return term && list && typeof raw.remove === 'boolean'
        ? { kind: 'term', list, term, remove: raw.remove }
        : null
    }
    case 'say': {
      const text = textOf(raw.text)
      const replyToId = textOf(raw.replyToId, false)
      return text ? { kind: 'say', text, ...(replyToId ? { replyToId } : {}) } : null
    }
    case 'pin': {
      const messageId = textOf(raw.messageId)
      const seconds = raw.seconds === undefined ? undefined : Number(raw.seconds)
      return messageId
        ? {
            kind: 'pin',
            messageId,
            ...(seconds !== undefined && Number.isInteger(seconds) ? { seconds } : {}),
          }
        : null
    }
    case 'unpin': {
      const messageId = textOf(raw.messageId)
      return messageId ? { kind: 'unpin', messageId } : null
    }
    case 'poll':
      return readPoll(raw)
    case 'pollEnd': {
      const pollId = textOf(raw.pollId)
      return pollId ? { kind: 'pollEnd', pollId } : null
    }
    default:
      return null
  }
}
