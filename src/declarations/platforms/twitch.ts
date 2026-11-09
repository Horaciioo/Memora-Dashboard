import { readSecret } from '@/declarations/platforms/credentials'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'

// Fake Twitch, dev only
const MOCK_ORIGIN =
  APP_ENVIRONMENT === 'dev' ? readSecret(process.env.TWITCH_MOCK_URL)?.replace(/\/+$/, '') : null

// Path the app serves the fake consent page on, forwarded to the fake Twitch
export const TWITCH_MOCK_PATH = '/faux-twitch'
export const TWITCH_MOCK_ORIGIN = MOCK_ORIGIN ?? null

// Server side origins
const ID_ORIGIN = MOCK_ORIGIN ?? 'https://id.twitch.tv'
const API_ORIGIN = MOCK_ORIGIN ?? 'https://api.twitch.tv'
const EVENTSUB_ORIGIN = MOCK_ORIGIN?.replace(/^http/, 'ws') ?? 'wss://eventsub.wss.twitch.tv'

/**
 * Twitch endpoints
 * @type {Record<string, string>}
 */

export const TWITCH_ENDPOINTS = {
  authorize: `${ID_ORIGIN}/oauth2/authorize`,
  token: `${ID_ORIGIN}/oauth2/token`,
  revoke: `${ID_ORIGIN}/oauth2/revoke`,
  helix: `${API_ORIGIN}/helix`,
  eventsub: `${EVENTSUB_ORIGIN}/ws`,
  player: 'https://player.twitch.tv',
  playerScript: 'https://player.twitch.tv/js/embed/v1.js',
  site: 'https://www.twitch.tv',
  images: 'https://static-cdn.jtvnw.net',
} as const

/**
 * Helix paths
 * @type {Record<string, string>}
 */

export const HELIX_PATHS = {
  users: '/users',
  streams: '/streams',
  moderatedChannels: '/moderation/channels',
  chatMessage: '/moderation/chat',
  bans: '/moderation/bans',
  warnings: '/moderation/warnings',
  unbanRequests: '/moderation/unban_requests',
  automod: '/moderation/automod/message',
  blockedTerms: '/moderation/blocked_terms',
  shieldMode: '/moderation/shield_mode',
  moderators: '/moderation/moderators',
  vips: '/channels/vips',
  chatSettings: '/chat/settings',
  chatSend: '/chat/messages',
  pins: '/chat/pins',
  polls: '/polls',
  games: '/games',
  banned: '/moderation/banned',
  channels: '/channels',
  emotes: '/chat/emotes',
  emotesGlobal: '/chat/emotes/global',
  emotesUser: '/chat/emotes/user',
  chatters: '/chat/chatters',
  subscriptions: '/eventsub/subscriptions',
} as const

// Held by the channel owner to run polls
export const TWITCH_POLL_SCOPE = 'channel:manage:polls'

/**
 * Scopes asked of a moderator
 * @type {readonly string[]}
 */

export const TWITCH_SCOPES: readonly string[] = [
  'user:read:chat',
  'user:write:chat',
  'user:read:moderated_channels',
  'user:read:emotes',
  'moderator:read:chatters',
  'moderator:read:moderators',
  'moderator:read:vips',
  'moderator:manage:chat_messages',
  'moderator:manage:banned_users',
  'moderator:manage:warnings',
  'moderator:manage:chat_settings',
  'moderator:manage:shield_mode',
  'moderator:manage:automod',
  'moderator:manage:blocked_terms',
  'moderator:manage:unban_requests',
  TWITCH_POLL_SCOPE,
]

/**
 * Whose identifier a subscription condition carries next to the channel
 * @typedef {'user' | 'moderator' | 'none'} ConditionHolder
 */

export type ConditionHolder = 'user' | 'moderator' | 'none'

/**
 * One EventSub subscription opened per live
 * @typedef {Object} TwitchSubscription
 * @property {string} type - Subscription type
 * @property {string} version - Version
 * @property {ConditionHolder} holder - Second condition field
 */

export interface TwitchSubscription {
  type: string
  version: string
  holder: ConditionHolder
}

/**
 * Subscriptions of a Mod View
 * @type {readonly TwitchSubscription[]}
 */

export const TWITCH_SUBSCRIPTIONS: readonly TwitchSubscription[] = [
  { type: 'channel.chat.message', version: '1', holder: 'user' },
  { type: 'channel.chat.message_delete', version: '1', holder: 'user' },
  { type: 'channel.chat.clear_user_messages', version: '1', holder: 'user' },
  { type: 'channel.chat_settings.update', version: '1', holder: 'user' },
  { type: 'channel.moderate', version: '2', holder: 'moderator' },
  { type: 'automod.message.hold', version: '2', holder: 'moderator' },
  { type: 'automod.message.update', version: '2', holder: 'moderator' },
  { type: 'channel.unban_request.create', version: '1', holder: 'moderator' },
  { type: 'channel.unban_request.resolve', version: '1', holder: 'moderator' },
  { type: 'channel.shield_mode.begin', version: '1', holder: 'moderator' },
  { type: 'channel.shield_mode.end', version: '1', holder: 'moderator' },
  { type: 'stream.online', version: '1', holder: 'none' },
  { type: 'stream.offline', version: '1', holder: 'none' },
]

// Revocations that mean the watching seat lost its rights
export const TWITCH_SEAT_REVOCATIONS: readonly string[] = [
  'authorization_revoked',
  'moderator_removed',
  'user_removed',
]

/**
 * Limits of the platform
 * @type {Record<string, number>}
 */

export const TWITCH_LIMITS = {
  // Seconds left to subscribe once the welcome arrived
  subscribeWindowSeconds: 10,
  // Longest timeout Twitch accepts
  maxTimeoutSeconds: 1209600,
  // Longest slow mode delay
  maxSlowSeconds: 120,
  // Longest ban or warning reason
  maxReasonLength: 500,
  // Chatters fetched per page
  chattersPage: 1000,
  // Longest follow age asked of a chatter, in minutes
  maxFollowMinutes: 129_600,
  // Pin length window
  minPinSeconds: 30,
  maxPinSeconds: 1800,
} as const

/**
 * Credentials of the Twitch application
 * @typedef {Object} TwitchCredentials
 * @property {string | null} clientId - Application identifier
 * @property {string | null} clientSecret - Application secret
 * @property {string | null} redirectUri - Registered callback
 */

export interface TwitchCredentials {
  clientId: string | null
  clientSecret: string | null
  redirectUri: string | null
}

/**
 * Twitch application credentials
 * @type {TwitchCredentials}
 */

export const TWITCH_CREDENTIALS: TwitchCredentials = {
  clientId: readSecret(process.env.TWITCH_CLIENT_ID),
  clientSecret: readSecret(process.env.TWITCH_CLIENT_SECRET),
  redirectUri: readSecret(process.env.TWITCH_REDIRECT_URI),
}

/**
 * Whether the Twitch link can be offered
 * @return {boolean} - Configured
 */

export const isTwitchConfigured = (): boolean =>
  Boolean(
    TWITCH_CREDENTIALS.clientId && TWITCH_CREDENTIALS.clientSecret && TWITCH_CREDENTIALS.redirectUri
  )
