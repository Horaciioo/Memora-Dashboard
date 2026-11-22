/**
 * One chat message to keep
 * @typedef {Object} ChatRecord
 * @property {string} externalId - Message identifier
 * @property {string} platformUserId - Chatter account
 * @property {string} viewerLogin - Chatter login
 * @property {string} body - Message text
 * @property {string} sentAt - When it was sent
 * @property {boolean} [blocked] - Held by the automod
 */

export interface ChatRecord {
  externalId: string
  platformUserId: string
  viewerLogin: string
  body: string
  sentAt: string
  blocked?: boolean
}

// Read a string field
const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * Chat message of a raw notification
 * @param {string} type - Subscription type
 * @param {Record<string, unknown>} event - Event payload
 * @param {string} at - Notification time
 * @return {ChatRecord | null} - Record
 */

export const chatRecordOf = (
  type: string,
  event: Record<string, unknown>,
  at: string
): ChatRecord | null => {
  // Held by the automod, never reaches the chat
  if (type === 'automod.message.hold') {
    const held = event.message as { text?: unknown } | undefined
    const blocked = {
      externalId: text(event.message_id),
      platformUserId: text(event.user_id),
      viewerLogin: text(event.user_login),
      body: text(held?.text),
      sentAt: text(event.held_at) || at,
      blocked: true,
    }

    return blocked.externalId && blocked.platformUserId && blocked.body ? blocked : null
  }

  if (type !== 'channel.chat.message') return null

  const message = event.message as { text?: unknown } | undefined
  const record = {
    externalId: text(event.message_id),
    platformUserId: text(event.chatter_user_id),
    viewerLogin: text(event.chatter_user_login),
    body: text(message?.text),
    sentAt: at,
  }

  return record.externalId && record.platformUserId && record.body ? record : null
}
