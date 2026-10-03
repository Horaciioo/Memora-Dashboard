import type { ChatOptionName } from '@/declarations/modview/registries'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Badge drawn before a chatter's name
 * @typedef {'broadcaster' | 'moderator' | 'vip' | 'bot' | 'subscriber'} ChatBadge
 */

export type ChatBadge = 'broadcaster' | 'moderator' | 'vip' | 'bot' | 'subscriber'

/**
 * One person of the chat
 * @typedef {Object} Chatter
 * @property {string} id - Platform user identifier
 * @property {string} login - Login, lower case
 * @property {string} name - Display name
 * @property {string | null} colour - Name colour picked on the platform
 * @property {ChatBadge[]} badges - Badges
 */

export interface Chatter {
  id: string
  login: string
  name: string
  colour: string | null
  badges: ChatBadge[]
}

/**
 * One chat message
 * @typedef {Object} ChatMessage
 */

export interface ChatMessage {
  id: string
  author: Chatter
  text: string
  sentAt: string
  // First message of this chatter on the channel
  isFirst?: boolean
  // Removed by a moderator, kept greyed in place
  deletedBy?: string | null
  // Words the automod would hold, drawn in red
  flagged?: string[]
  // Line a scene points at
  highlighted?: boolean
}

/**
 * Kind of moderation act
 * @typedef {'delete' | 'warn' | 'timeout' | 'ban' | 'unban' | 'automodApprove' | 'automodDeny' | 'termAdd' | 'termRemove' | 'mode' | 'unbanRequest'} ModActKind
 */

export type ModActKind =
  | 'delete'
  | 'warn'
  | 'timeout'
  | 'ban'
  | 'unban'
  | 'automodApprove'
  | 'automodDeny'
  | 'termAdd'
  | 'termRemove'
  | 'mode'
  | 'unbanRequest'

/**
 * One line of the moderator actions window
 * @typedef {Object} ModAct
 */

export interface ModAct {
  id: string
  kind: ModActKind
  target: string | null
  moderator: string
  at: string
  durationSeconds?: number | null
  reason?: string | null
  // Message or term the act was about
  quote?: string | null
  // Still waiting on the platform
  pending?: boolean
}

/**
 * One message held by the automod
 * @typedef {Object} HeldMessage
 */

export interface HeldMessage {
  id: string
  author: Chatter
  text: string
  flagged: string[]
  category: string
  at: string
}

/**
 * One request to be unbanned
 * @typedef {Object} UnbanRequest
 */

export interface UnbanRequest {
  id: string
  author: Chatter
  text: string
  at: string
}

/**
 * Chat restrictions in force
 * @typedef {Object} ChatModes
 */

export interface ChatModes {
  shield: boolean
  subscribers: boolean
  followers: boolean
  emotes: boolean
  // Seconds between two messages, off when null
  slowSeconds: number | null
}

/**
 * Toggleable chat mode
 * @typedef {keyof Omit<ChatModes, 'slowSeconds'> | 'slow'} ChatModeName
 */

export type ChatModeName = 'shield' | 'subscribers' | 'followers' | 'emotes' | 'slow'

/**
 * Connection to the platform
 * @typedef {'connected' | 'connecting' | 'disconnected' | 'scripted'} ModViewConnection
 */

export type ModViewConnection = 'connected' | 'connecting' | 'disconnected' | 'scripted'

/**
 * Everything the Mod View draws
 * @typedef {Object} ModViewState
 */

export interface ModViewState {
  platform: LivePlatformName
  connection: ModViewConnection
  channel: {
    name: string
    avatar: string | null
    category: string | null
    categoryArt: string | null
  }
  title: string
  embedUrl: string | null
  messages: ChatMessage[]
  acts: ModAct[]
  held: HeldMessage[]
  unbanRequests: UnbanRequest[]
  blockedTerms: string[]
  allowedTerms: string[]
  modes: ChatModes
  community: {
    broadcaster: Chatter[]
    moderators: Chatter[]
    vips: Chatter[]
    bots: Chatter[]
    viewers: Chatter[]
  }
  // Livecon level in force, 1 forbids public talk
  liveconLevel: number | null
  // Scene-driven chat menu
  chatScript?: ChatScript
}

/**
 * Chat menu a scene drives
 * @typedef {Object} ChatScript
 * @property {'modes' | 'options' | null} menu - Open menu
 * @property {Partial<Record<ChatOptionName, boolean>>} options - Forced options
 * @property {ChatOptionName | null} lit - Option being set
 */

export interface ChatScript {
  menu: 'modes' | 'options' | null
  options: Partial<Record<ChatOptionName, boolean>>
  lit: ChatOptionName | null
}

/**
 * Gesture the interface asks for
 * @typedef {Object} ModViewIntent
 */

export type ModViewIntent =
  | { kind: 'delete'; messageId: string; chatterId: string }
  | { kind: 'warn'; chatterId: string; reason: string }
  | { kind: 'timeout'; chatterId: string; seconds: number; reason: string | null }
  | { kind: 'ban'; chatterId: string; reason: string | null }
  | { kind: 'unban'; chatterId: string }
  | { kind: 'automod'; heldId: string; approve: boolean }
  | { kind: 'unbanRequest'; requestId: string; approve: boolean }
  | { kind: 'mode'; mode: ChatModeName; enabled: boolean; seconds?: number }
  | { kind: 'term'; list: 'blocked' | 'allowed'; term: string; remove: boolean }
  | { kind: 'say'; text: string }

/**
 * Window of the Mod View grid
 * @typedef {'stream' | 'modActions' | 'automod' | 'chat' | 'community' | 'unbanRequests'} ModViewWindow
 */

export type ModViewWindow =
  'stream' | 'modActions' | 'automod' | 'chat' | 'community' | 'unbanRequests'

/**
 * Part a scene may light up
 * @typedef {ModViewWindow | 'title' | 'modes' | 'chatOptions' | 'broadcaster' | 'moderators' | 'vips'} ModViewTarget
 */

export type ModViewTarget =
  ModViewWindow | 'title' | 'modes' | 'chatOptions' | 'broadcaster' | 'moderators' | 'vips'

/**
 * Source feeding the Mod View
 * @typedef {Object} ModViewDriver
 * @property {ModViewState} state - Current state
 * @property {(intent: ModViewIntent) => Promise<void>} act - Carry out a gesture
 * @property {ModViewTarget | null} spotlight - Part lit by a scene
 */

export interface ModViewDriver {
  state: ModViewState
  act: (intent: ModViewIntent) => Promise<void>
  spotlight: ModViewTarget | null
}
