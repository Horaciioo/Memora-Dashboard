import { FakeRefusal, channelFields, moderate, postMessage, userFields } from './effects.ts'
import { notify } from './eventsub.ts'
import type { FakeUser } from './identities.ts'
import { nextId } from './world.ts'
import type { Channel } from './world.ts'

/**
 * Chat settings patch sent by Helix
 * @typedef {Object} SettingsPatch
 */

export interface SettingsPatch {
  slow_mode?: boolean
  slow_mode_wait_time?: number
  follower_mode?: boolean
  follower_mode_duration?: number
  subscriber_mode?: boolean
  emote_mode?: boolean
}

/**
 * Settings row as Helix shows it
 * @param {Channel} channel - Channel
 * @return {Record<string, unknown>} - Row
 */

export const settingsRow = (channel: Channel): Record<string, unknown> => ({
  broadcaster_id: channel.broadcaster.id,
  slow_mode: channel.settings.slowSeconds !== null,
  slow_mode_wait_time: channel.settings.slowSeconds,
  follower_mode: channel.settings.followers,
  follower_mode_duration: channel.settings.followers ? channel.settings.followerMinutes : null,
  subscriber_mode: channel.settings.subscribers,
  emote_mode: channel.settings.emotes,
  unique_chat_mode: false,
  non_moderator_chat_delay: false,
  non_moderator_chat_delay_duration: null,
})

/**
 * Mode action names of channel.moderate
 * @param {SettingsPatch} patch - Patch
 * @return {[string, Record<string, unknown> | null][]} - Actions
 */

const modeActionsOf = (patch: SettingsPatch): [string, Record<string, unknown> | null][] => {
  const actions: [string, Record<string, unknown> | null][] = []
  if (patch.slow_mode !== undefined) {
    actions.push(
      patch.slow_mode
        ? ['slow', { wait_time_seconds: patch.slow_mode_wait_time ?? 30 }]
        : ['slowoff', null]
    )
  }
  if (patch.follower_mode !== undefined) {
    actions.push(
      patch.follower_mode
        ? ['followers', { follow_duration_minutes: patch.follower_mode_duration ?? 0 }]
        : ['followersoff', null]
    )
  }
  if (patch.subscriber_mode !== undefined) {
    actions.push([patch.subscriber_mode ? 'subscribers' : 'subscribersoff', null])
  }
  if (patch.emote_mode !== undefined)
    actions.push([patch.emote_mode ? 'emoteonly' : 'emoteonlyoff', null])

  return actions
}

/**
 * Change the chat settings
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {SettingsPatch} patch - Patch
 * @return {void}
 */

export const updateSettings = (
  channel: Channel,
  moderator: FakeUser,
  patch: SettingsPatch
): void => {
  // Apply the patch
  if (patch.slow_mode !== undefined) {
    channel.settings.slowSeconds = patch.slow_mode ? (patch.slow_mode_wait_time ?? 30) : null
  }
  if (patch.follower_mode !== undefined) {
    channel.settings.followers = patch.follower_mode
    channel.settings.followerMinutes = patch.follower_mode_duration ?? 0
  }
  if (patch.subscriber_mode !== undefined) channel.settings.subscribers = patch.subscriber_mode
  if (patch.emote_mode !== undefined) channel.settings.emotes = patch.emote_mode

  // Twitch announces both
  modeActionsOf(patch).forEach(([action, detail]) => moderate(channel, moderator, action, detail))
  notify('channel.chat_settings.update', {
    ...channelFields(channel),
    emote_mode: channel.settings.emotes,
    follower_mode: channel.settings.followers,
    follower_mode_duration_minutes: channel.settings.followers
      ? channel.settings.followerMinutes
      : null,
    slow_mode: channel.settings.slowSeconds !== null,
    slow_mode_wait_time_seconds: channel.settings.slowSeconds,
    subscriber_mode: channel.settings.subscribers,
    unique_chat_mode: false,
  })
}

/**
 * Turn the shield mode on or off
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {boolean} isActive - Wanted state
 * @return {void}
 */

export const setShield = (channel: Channel, moderator: FakeUser, isActive: boolean): void => {
  channel.shield = isActive
  const at = new Date().toISOString()
  notify(isActive ? 'channel.shield_mode.begin' : 'channel.shield_mode.end', {
    ...channelFields(channel),
    ...userFields('moderator_user', moderator),
    ...(isActive ? { started_at: at } : { ended_at: at }),
  })
}

/**
 * Add or remove a blocked term
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {Object} change - Change
 * @param {string} change.text - Term
 * @param {boolean} change.isAdd - Added or removed
 * @return {string} - Term identifier
 */

export const changeTerm = (
  channel: Channel,
  moderator: FakeUser,
  change: { text: string; isAdd: boolean }
): string => {
  const known = [...channel.terms].find(([, text]) => text === change.text.toLowerCase())
  const id = known?.[0] ?? nextId()
  if (change.isAdd) channel.terms.set(id, change.text.toLowerCase())
  else channel.terms.delete(id)

  moderate(channel, moderator, 'automod_terms', {
    action: change.isAdd ? 'add' : 'remove',
    list: 'blocked',
    terms: [change.text],
    from_automod: false,
  })

  return id
}

/**
 * Approve or deny a held line
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {Object} decision - Decision
 * @param {string} decision.messageId - Held line
 * @param {boolean} decision.approve - Approved
 * @return {void}
 */

export const resolveHeld = (
  channel: Channel,
  moderator: FakeUser,
  decision: { messageId: string; approve: boolean }
): void => {
  const held = channel.held.get(decision.messageId)
  if (!held) throw new FakeRefusal(404, 'The message specified in msg_id was not found.')

  channel.held.delete(held.id)
  notify('automod.message.update', {
    ...channelFields(channel),
    ...userFields('user', held.author),
    ...userFields('moderator_user', moderator),
    message_id: held.id,
    message: { text: held.text, fragments: [{ type: 'text', text: held.text }] },
    status: decision.approve ? 'Approved' : 'Denied',
    held_at: new Date(held.at).toISOString(),
  })

  // An approved line reaches the chat
  if (decision.approve) postMessage(channel, held.author, held.text)
}

/**
 * Open an unban request
 * @param {Channel} channel - Channel
 * @param {FakeUser} author - Banned viewer
 * @param {string} text - Request text
 * @return {void}
 */

export const openUnbanRequest = (channel: Channel, author: FakeUser, text: string): void => {
  const request = { id: nextId(), user: author, text, at: new Date().toISOString() }
  channel.unbanRequests.set(request.id, request)
  notify('channel.unban_request.create', {
    id: request.id,
    ...channelFields(channel),
    ...userFields('user', author),
    text,
    created_at: request.at,
  })
}

/**
 * Settle an unban request
 * @param {Channel} channel - Channel
 * @param {FakeUser} moderator - Who acts
 * @param {Object} decision - Decision
 * @param {string} decision.requestId - Request
 * @param {boolean} decision.approve - Approved
 * @return {Record<string, unknown>} - Helix row
 */

export const resolveUnbanRequest = (
  channel: Channel,
  moderator: FakeUser,
  decision: { requestId: string; approve: boolean }
): Record<string, unknown> => {
  const request = channel.unbanRequests.get(decision.requestId)
  if (!request) throw new FakeRefusal(404, 'The unban request was not found.')

  channel.unbanRequests.delete(request.id)
  if (decision.approve) channel.bans.delete(request.user.id)
  const status = decision.approve ? 'approved' : 'denied'

  // Both events, like Twitch
  notify('channel.unban_request.resolve', {
    id: request.id,
    ...channelFields(channel),
    ...userFields('moderator_user', moderator),
    ...userFields('user', request.user),
    resolution_text: '',
    status,
  })
  moderate(channel, moderator, 'unban_request', {
    is_approved: decision.approve,
    ...userFields('user', request.user),
    moderator_message: '',
  })

  return { id: request.id, ...channelFields(channel), ...userFields('user', request.user), status }
}

/**
 * Put the channel on air
 * @param {Channel} channel - Channel
 * @return {boolean} - Changed
 */

export const goOnline = (channel: Channel): boolean => {
  if (channel.stream) return false

  channel.stream = { id: String(Date.now()), startedAt: new Date().toISOString() }
  channel.viewers = 800 + Math.floor(Math.random() * 400)
  notify('stream.online', {
    id: channel.stream.id,
    ...channelFields(channel),
    type: 'live',
    started_at: channel.stream.startedAt,
  })

  return true
}

/**
 * Take the channel off air
 * @param {Channel} channel - Channel
 * @return {boolean} - Changed
 */

export const goOffline = (channel: Channel): boolean => {
  if (!channel.stream) return false

  channel.stream = null
  channel.viewers = 0
  notify('stream.offline', channelFields(channel))

  return true
}
