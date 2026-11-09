import { notify } from './eventsub.ts'
import type { FakeUser } from './identities.ts'
import { isModerator, keepMessage, nextId } from './world.ts'
import type { Channel, FakeMessage } from './world.ts'

/**
 * Refusal answered like Twitch
 * @typedef {Object} FakeRefusal
 */

export class FakeRefusal extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * User fields of a payload
 * @param {string} prefix - Field prefix
 * @param {FakeUser} user - User
 * @return {Record<string, string>} - Fields
 */

export const userFields = (prefix: string, user: FakeUser): Record<string, string> => ({
  [`${prefix}_id`]: user.id,
  [`${prefix}_login`]: user.login,
  [`${prefix}_name`]: user.name,
})

/**
 * Broadcaster fields of a payload
 * @param {Channel} channel - Channel
 * @return {Record<string, string>} - Fields
 */

export const channelFields = (channel: Channel): Record<string, string> =>
  userFields('broadcaster_user', channel.broadcaster)

/**
 * Echo of a moderation action
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acted
 * @param {string} action - Action name
 * @param {Record<string, unknown> | null} detail - Action detail
 * @return {void}
 */

export const moderate = (
  channel: Channel,
  moderator: FakeUser,
  action: string,
  detail: Record<string, unknown> | null
): void => {
  notify('channel.moderate', {
    ...channelFields(channel),
    source_broadcaster_user_id: null,
    ...userFields('moderator_user', moderator),
    action,
    [action]: detail,
  })
}

// Twitch's own emotes, as the platform numbers them
export const TWITCH_EMOTES: Record<string, string> = {
  Kappa: '25',
  LUL: '425618',
  PogChamp: '305954156',
  Kreygasm: '41',
  BibleThump: '86',
  '4Head': '354',
  '<3': '9',
}

/**
 * Cut a text into the fragments Twitch sends
 * @param {string} text - Text
 * @return {Record<string, unknown>[]} - Fragments
 */

export const fragmentsOf = (text: string): Record<string, unknown>[] =>
  text.split(/(\s+)/).reduce<Record<string, unknown>[]>((pieces, word) => {
    const id = TWITCH_EMOTES[word]
    const piece = id
      ? {
          type: 'emote',
          text: word,
          cheermote: null,
          emote: { id, emote_set_id: '0', owner_id: '0', format: ['static'] },
          mention: null,
        }
      : { type: 'text', text: word, cheermote: null, emote: null, mention: null }
    const last = pieces[pieces.length - 1]

    // Neighbouring words stay one text piece
    if (!id && last?.type === 'text') last.text = `${String(last.text)}${word}`
    else pieces.push(piece)

    return pieces
  }, [])

/**
 * Post one chat line
 * @param {Channel} channel - Channel
 * @param {FakeUser} author - Author
 * @param {string} text - Text
 * @param {string | null} [replyToId] - Message answered
 * @return {FakeMessage} - Message
 */

export const postMessage = (
  channel: Channel,
  author: FakeUser,
  text: string,
  replyToId: string | null = null
): FakeMessage => {
  const message = { id: nextId(), author, text, at: Date.now() }
  const parent = replyToId ? channel.messages.find((entry) => entry.id === replyToId) : undefined
  keepMessage(channel, message)
  notify('channel.chat.message', {
    ...channelFields(channel),
    ...userFields('chatter_user', author),
    message_id: message.id,
    message: { text, fragments: fragmentsOf(text) },
    color: author.colour,
    badges: author.badges.map((setId) => ({ set_id: setId, id: '1', info: '' })),
    message_type: 'text',
    cheer: null,
    reply: parent
      ? {
          parent_message_id: parent.id,
          parent_message_body: parent.text,
          parent_user_id: parent.author.id,
          parent_user_name: parent.author.name,
          parent_user_login: parent.author.login,
          thread_message_id: parent.id,
          thread_user_id: parent.author.id,
          thread_user_name: parent.author.name,
          thread_user_login: parent.author.login,
        }
      : null,
    channel_points_custom_reward_id: null,
  })

  return message
}

/**
 * Hold a line for AutoMod
 * @param {Channel} channel - Channel
 * @param {FakeUser} author - Author
 * @param {Object} line - Held line
 * @param {string} line.text - Text
 * @param {string} line.category - AutoMod category
 * @param {string} line.flagged - Flagged words
 * @param {string | null} [termId] - Blocked term caught
 * @return {void}
 */

export const holdMessage = (
  channel: Channel,
  author: FakeUser,
  line: { text: string; category: string; flagged: string },
  termId: string | null = null
): void => {
  const message = { id: nextId(), author, text: line.text, at: Date.now() }
  const start = Math.max(0, line.text.toLowerCase().indexOf(line.flagged.toLowerCase()))
  const boundary = { start_pos: start, end_pos: start + line.flagged.length - 1 }
  channel.held.set(message.id, message)

  notify('automod.message.hold', {
    ...channelFields(channel),
    ...userFields('user', author),
    message_id: message.id,
    message: { text: line.text, fragments: [{ type: 'text', text: line.text }] },
    reason: termId ? 'blocked_term' : 'automod',
    automod: termId ? null : { category: line.category, level: 3, boundaries: [boundary] },
    blocked_term: termId
      ? {
          terms_found: [
            { term_id: termId, boundary, owner_broadcaster_user_id: channel.broadcaster.id },
          ],
        }
      : null,
    held_at: new Date().toISOString(),
  })
}

/**
 * Ban or time out a chatter
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {FakeUser} target - Chatter
 * @param {Object} sanction - Sanction
 * @param {number | null} sanction.seconds - Timeout length, none for a ban
 * @param {string} sanction.reason - Reason
 * @return {void}
 */

export const banUser = (
  channel: Channel,
  moderator: FakeUser,
  target: FakeUser,
  sanction: { seconds: number | null; reason: string }
): void => {
  if (target.id === channel.broadcaster.id || isModerator(target.id)) {
    throw new FakeRefusal(400, 'The user specified in the user_id field may not be banned.')
  }
  if (channel.bans.has(target.id) && channel.bans.get(target.id) === null) {
    throw new FakeRefusal(400, 'The user specified in the user_id field is already banned.')
  }

  const expiresAt = sanction.seconds ? Date.now() + sanction.seconds * 1000 : null
  channel.bans.set(target.id, expiresAt)

  // Twitch clears the chatter's lines too
  moderate(channel, moderator, sanction.seconds ? 'timeout' : 'ban', {
    ...userFields('user', target),
    reason: sanction.reason,
    ...(expiresAt ? { expires_at: new Date(expiresAt).toISOString() } : {}),
  })
  notify('channel.chat.clear_user_messages', {
    ...channelFields(channel),
    ...userFields('target_user', target),
  })
}

/**
 * Lift a ban or a timeout
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {FakeUser} target - Chatter
 * @return {void}
 */

export const unbanUser = (channel: Channel, moderator: FakeUser, target: FakeUser): void => {
  if (!channel.bans.has(target.id)) {
    throw new FakeRefusal(400, 'The user specified in the user_id field is not banned.')
  }

  const wasTimeout = channel.bans.get(target.id) !== null
  channel.bans.delete(target.id)
  moderate(channel, moderator, wasTimeout ? 'untimeout' : 'unban', userFields('user', target))
}

/**
 * Delete one chat line
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {string} messageId - Message
 * @return {void}
 */

export const deleteMessage = (channel: Channel, moderator: FakeUser, messageId: string): void => {
  const message = channel.messages.find((entry) => entry.id === messageId)
  if (!message) throw new FakeRefusal(404, 'The message specified in the message_id was not found.')
  if (message.author.id === channel.broadcaster.id || isModerator(message.author.id)) {
    throw new FakeRefusal(400, 'You may not delete another moderator’s messages.')
  }

  channel.messages = channel.messages.filter((entry) => entry.id !== messageId)
  moderate(channel, moderator, 'delete', {
    ...userFields('user', message.author),
    message_id: message.id,
    message_body: message.text,
  })
  notify('channel.chat.message_delete', {
    ...channelFields(channel),
    ...userFields('target_user', message.author),
    message_id: message.id,
  })
}

/**
 * Warn a chatter
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {FakeUser} target - Chatter
 * @param {string} reason - Reason
 * @return {void}
 */

export const warnUser = (
  channel: Channel,
  moderator: FakeUser,
  target: FakeUser,
  reason: string
): void => {
  moderate(channel, moderator, 'warn', {
    ...userFields('user', target),
    reason,
    chat_rules_cited: null,
  })
}
