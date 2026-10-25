import type { ChatOptionName } from '@/declarations/modview/registries'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Badge drawn before a chatter's name
 * @typedef {'broadcaster' | 'moderator' | 'vip' | 'bot' | 'subscriber'} ChatBadge
 */

export type ChatBadge = 'broadcaster' | 'moderator' | 'vip' | 'bot' | 'subscriber'

/**
 * Memora rank of a Twitch account
 * @typedef {'admin' | 'responsable' | 'moderator'} MemoraRank
 */

export type MemoraRank = 'admin' | 'responsable' | 'moderator'

/**
 * Who a chatter is to the team, for the name colour
 * @typedef {'creator' | MemoraRank | 'viewer'} ChatTier
 */

export type ChatTier = 'creator' | MemoraRank | 'viewer'

/**
 * One person of the chat
 * @typedef {Object} Chatter
 * @property {string} id - Platform user identifier
 * @property {string} login - Login
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
 * Piece of a message as the platform cut it
 * @typedef {Object} ChatFragment
 * @property {'text' | 'emote' | 'mention'} type - Nature
 * @property {string} text - Words as typed
 * @property {string} [emoteId] - Platform emote identifier
 * @property {boolean} [animated] - Emote moves
 */

export interface ChatFragment {
  type: 'text' | 'emote' | 'mention'
  text: string
  emoteId?: string
  animated?: boolean
}

/**
 * Line a message answers
 * @typedef {Object} ChatReply
 * @property {string} id - Parent message identifier
 * @property {string} authorName - Parent author
 * @property {string} text - Parent text
 */

export interface ChatReply {
  id: string
  authorName: string
  text: string
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
  // Text cut into words, emotes and mentions
  fragments?: ChatFragment[]
  // Line this one answers
  reply?: ChatReply
  // First message of this chatter on the channel
  isFirst?: boolean
  // Removed by a moderator
  deletedBy?: string | null
  // Words the automod would hold
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
  // Platform identifier of the target
  targetId?: string | null
  durationSeconds?: number | null
  reason?: string | null
  // Message or term the act was about
  quote?: string | null
  // Still waiting on the platform
  pending?: boolean
}

/**
 * Colour of an act verb
 * @typedef {'danger' | 'caution' | 'success' | 'info'} ModActTone
 */

export type ModActTone = 'danger' | 'caution' | 'success' | 'info'

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
  // Platform key of the category
  categoryKey?: string
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
 * Message pinned at the top of the chat
 * @typedef {Object} PinnedMessage
 * @property {string} messageId - Message identifier
 * @property {Chatter} author - Who wrote it
 * @property {string} text - Message
 * @property {ChatFragment[]} fragments - Message cut into pieces
 * @property {string} pinnedBy - Who pinned it
 * @property {string | null} endsAt - ISO end, none when it stays until the stream ends
 */

export interface PinnedMessage {
  messageId: string
  author: Chatter
  text: string
  fragments: ChatFragment[]
  pinnedBy: string
  endsAt: string | null
}

/**
 * One Twitch emote a message may carry
 * @typedef {Object} TwitchEmote
 * @property {string} id - Emote identifier
 * @property {string} name - Word that writes it
 * @property {boolean} animated - Emote moves
 * @property {'subscriptions' | 'bitstier' | 'follower' | null} kind - What unlocks it, none for a free one
 * @property {boolean} isLocked - The member cannot use it
 */

export interface TwitchEmote {
  id: string
  name: string
  animated: boolean
  kind: 'subscriptions' | 'bitstier' | 'follower' | null
  isLocked: boolean
}

/**
 * Emotes offered in the chat box
 * @typedef {Object} LiveEmotes
 * @property {TwitchEmote[]} global - Emotes of Twitch itself
 * @property {TwitchEmote[]} channel - Emotes of the channel
 * @property {boolean} isVerified - What the member may use was checked
 */

export interface LiveEmotes {
  global: TwitchEmote[]
  channel: TwitchEmote[]
  isVerified: boolean
}

/**
 * Choices a moderator keeps from one live to the next
 * @typedef {Object} ModPreferences
 * @property {boolean} timestamps - Hour before each line
 * @property {boolean} badges - Badges before each name
 * @property {boolean} deleted - Text of removed lines kept
 * @property {boolean} firstMessages - First lines framed
 * @property {boolean} colouredNames - Names in their own colour
 * @property {'hover' | 'alt'} pauseMode - What stands the chat still
 * @property {'left' | 'hover'} toolsPosition - Where the gestures of a line show
 * @property {boolean} keepResolved - Handled held messages stay in the queue
 */

export interface ModPreferences {
  timestamps: boolean
  badges: boolean
  deleted: boolean
  firstMessages: boolean
  colouredNames: boolean
  pauseMode: 'hover' | 'alt'
  toolsPosition: 'left' | 'hover'
  keepResolved: boolean
}

/**
 * What Twitch says of a banned viewer
 * @typedef {Object} BanDetail
 * @property {string | null} avatar - Profile picture address
 * @property {string | null} accountCreatedAt - ISO moment the account was made
 * @property {string | null} bannedBy - Moderator who banned
 * @property {string | null} bannedAt - ISO moment of the ban
 * @property {string | null} reason - Reason given
 */

export interface BanDetail {
  avatar: string | null
  accountCreatedAt: string | null
  bannedBy: string | null
  bannedAt: string | null
  reason: string | null
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
  // Seconds between two messages
  slowSeconds: number | null
  // Minutes a follower must have followed, none while the mode is off
  followerMinutes?: number | null
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
    // Tags the streamer gave the live
    tags?: string[]
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
  // Spectators watching now
  viewers?: number | null
  // Message pinned at the top of the chat
  pinned?: PinnedMessage | null
  // Livecon level in force
  liveconLevel: number | null
  // Scene-driven chat menu
  chatScript?: ChatScript
  // Why the platform is out of reach
  notice?: string | null
  // Seen but not moderated from here
  readOnly?: boolean
  // Memora ranks by Twitch user identifier
  roster?: Record<string, MemoraRank>
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
  | { kind: 'say'; text: string; replyToId?: string }
  | { kind: 'pin'; messageId: string; seconds?: number }
  | { kind: 'unpin'; messageId: string }

/**
 * Window of the Mod View grid
 * @typedef {'stream' | 'modActions' | 'automod' | 'chat' | 'community' | 'inspect'} ModViewWindow
 */

export type ModViewWindow = 'stream' | 'modActions' | 'automod' | 'chat' | 'community' | 'inspect'

/**
 * Part a scene may light up
 * @typedef {ModViewWindow | 'title' | 'modes' | 'chatOptions' | 'broadcaster' | 'moderators' | 'vips'} ModViewTarget
 */

export type ModViewTarget =
  ModViewWindow | 'title' | 'modes' | 'chatOptions' | 'broadcaster' | 'moderators' | 'vips'

/**
 * What a gesture carries beyond itself
 * @typedef {Object} ActContext
 * @property {string} [offenseId] - Panel offence applied
 * @property {number} [rung] - Panel rung applied
 * @property {string} [onBehalfOfId] - Member followed in Focus mode
 * @property {string} [targetLogin] - Viewer login
 */

export interface ActContext {
  offenseId?: string
  rung?: number
  onBehalfOfId?: string
  targetLogin?: string
}

/**
 * Source feeding the Mod View
 * @typedef {Object} ModViewDriver
 * @property {ModViewState} state - Current state
 * @property {(intent: ModViewIntent, context?: ActContext) => Promise<boolean>} act - Carry out a gesture, false when refused
 * @property {ModViewTarget | null} spotlight - Part lit by a scene
 */

export interface ModViewDriver {
  state: ModViewState
  act: (intent: ModViewIntent, context?: ActContext) => Promise<boolean>
  spotlight: ModViewTarget | null
}
