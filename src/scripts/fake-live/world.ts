import { randomUUID } from 'node:crypto'

import { FAKE_PREFIXES, OPERATOR_IDENTITIES, buildViewers, fakeUser } from './identities.ts'
import type { FakeUser } from './identities.ts'

/**
 * One chat line kept for deletes
 * @typedef {Object} FakeMessage
 * @property {string} id - Message identifier
 * @property {FakeUser} author - Author
 * @property {string} text - Text
 * @property {number} at - Sent time
 */

export interface FakeMessage {
  id: string
  author: FakeUser
  text: string
  at: number
}

/**
 * One fake channel
 * @typedef {Object} Channel
 */

export interface Channel {
  broadcaster: FakeUser
  stream: { id: string; startedAt: string } | null
  viewers: number
  title: string
  category: string
  settings: {
    slowSeconds: number | null
    followers: boolean
    followerMinutes: number
    subscribers: boolean
    emotes: boolean
  }
  shield: boolean
  terms: Map<string, string>
  bans: Map<string, number | null>
  unbanRequests: Map<string, { id: string; user: FakeUser; text: string; at: string }>
  held: Map<string, FakeMessage>
  messages: FakeMessage[]
  pin: { message: FakeMessage; by: FakeUser; endsAt: number | null } | null
}

// Messages kept per channel
const KEPT_MESSAGES = 300

// Token prefixes, stateless
const ACCESS_PREFIX = 'fake-access-'
const REFRESH_PREFIX = 'fake-refresh-'
const CODE_PREFIX = 'fake-code-'

/**
 * Application token
 * @type {string}
 */

export const APP_TOKEN = 'fake-app'

const users = new Map<string, FakeUser>()
const channels = new Map<string, Channel>()
const moderatorIds = new Set<string>()
const revokedIds = new Set<string>()
const viewers = buildViewers()

/**
 * Add a moderator of every channel
 * @param {FakeUser} user - Moderator
 * @return {void}
 */

export const registerModerator = (user: FakeUser): void => {
  users.set(user.id, user)
  moderatorIds.add(user.id)
}

// Known from the start
viewers.forEach((viewer) => users.set(viewer.id, viewer))
users.set(OPERATOR_IDENTITIES.viewer.id, OPERATOR_IDENTITIES.viewer)
registerModerator(OPERATOR_IDENTITIES.moderator)

/**
 * Name a channel before anyone asks
 * @param {string} id - Broadcaster identifier
 * @param {string} login - Channel login
 * @return {Channel} - Channel
 */

export const registerChannel = (id: string, login: string): Channel => {
  const known = channels.get(id)
  if (known) return known

  const broadcaster = fakeUser(id, login, ['broadcaster'])
  users.set(id, broadcaster)
  const channel: Channel = {
    broadcaster,
    stream: null,
    viewers: 0,
    title: `Faux live de ${login}`,
    category: 'Just Chatting',
    settings: {
      slowSeconds: null,
      followers: false,
      followerMinutes: 0,
      subscribers: false,
      emotes: false,
    },
    shield: false,
    terms: new Map(),
    bans: new Map(),
    unbanRequests: new Map(),
    held: new Map(),
    messages: [],
    pin: null,
  }
  channels.set(id, channel)

  return channel
}

/**
 * Channel of a broadcaster, made up if unknown
 * @param {string} id - Broadcaster identifier
 * @return {Channel} - Channel
 */

export const channelOf = (id: string): Channel =>
  channels.get(id) ?? registerChannel(id, `chaine_${id}`)

/**
 * Every channel known
 * @return {Channel[]} - Channels
 */

export const allChannels = (): Channel[] => [...channels.values()]

/**
 * Find a user by identifier
 * @param {string} id - Identifier
 * @return {FakeUser | null} - User
 */

export const userById = (id: string): FakeUser | null => users.get(id) ?? null

/**
 * Find a user by login, made up if unknown
 * @param {string} login - Login
 * @return {FakeUser} - User
 */

export const userByLogin = (login: string): FakeUser => {
  const found = [...users.values()].find((user) => user.login === login.toLowerCase())
  if (found) return found

  const invented = fakeUser(`${FAKE_PREFIXES.viewer}${String(users.size).padStart(6, '0')}`, login)
  users.set(invented.id, invented)

  return invented
}

/**
 * Viewers of the fake chat
 * @return {FakeUser[]} - Viewers
 */

export const allViewers = (): FakeUser[] => viewers

/**
 * Moderators other than the operator
 * @return {FakeUser[]} - Moderators
 */

export const teamModerators = (): FakeUser[] =>
  [...moderatorIds]
    .filter((id) => id !== OPERATOR_IDENTITIES.moderator.id)
    .flatMap((id) => users.get(id) ?? [])

/**
 * Whether a user moderates every channel
 * @param {string} id - User identifier
 * @return {boolean} - Moderator
 */

export const isModerator = (id: string): boolean => moderatorIds.has(id)

/**
 * Keep a message for later deletes
 * @param {Channel} channel - Channel
 * @param {FakeMessage} message - Message
 * @return {void}
 */

export const keepMessage = (channel: Channel, message: FakeMessage): void => {
  channel.messages.push(message)
  if (channel.messages.length > KEPT_MESSAGES) channel.messages.shift()
}

/**
 * Whether a viewer is banned or timed out
 * @param {Channel} channel - Channel
 * @param {string} userId - Viewer
 * @return {boolean} - Silenced
 */

export const isSilenced = (channel: Channel, userId: string): boolean => {
  if (!channel.bans.has(userId)) return false

  const until = channel.bans.get(userId)
  // Expired timeouts lift themselves
  if (until !== null && until !== undefined && until < Date.now()) {
    channel.bans.delete(userId)
    return false
  }

  return true
}

/**
 * Fresh identifier
 * @return {string} - UUID
 */

export const nextId = (): string => randomUUID()

/**
 * Tokens carried by a user
 * @param {string} userId - User
 * @return {{ code: string, access: string, refresh: string }} - Tokens
 */

export const tokensOf = (userId: string) => ({
  code: `${CODE_PREFIX}${userId}`,
  access: `${ACCESS_PREFIX}${userId}`,
  refresh: `${REFRESH_PREFIX}${userId}`,
})

/**
 * User behind a token or a code
 * @param {string} value - Token
 * @param {'code' | 'access' | 'refresh'} kind - Token kind
 * @return {FakeUser | null} - User
 */

export const userOfToken = (
  value: string,
  kind: 'code' | 'access' | 'refresh'
): FakeUser | null => {
  const prefix = { code: CODE_PREFIX, access: ACCESS_PREFIX, refresh: REFRESH_PREFIX }[kind]
  if (!value.startsWith(prefix)) return null

  const id = value.slice(prefix.length)

  return revokedIds.has(id) ? null : userById(id)
}

/**
 * Revoke or restore a user's tokens
 * @param {string} userId - User
 * @return {boolean} - Now revoked
 */

export const toggleRevoked = (userId: string): boolean => {
  if (revokedIds.delete(userId)) return false

  revokedIds.add(userId)

  return true
}
