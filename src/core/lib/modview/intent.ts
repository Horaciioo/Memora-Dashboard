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
      return chatterId && reason ? { kind: 'warn', chatterId, reason } : null
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
      return text ? { kind: 'say', text } : null
    }
    default:
      return null
  }
}
