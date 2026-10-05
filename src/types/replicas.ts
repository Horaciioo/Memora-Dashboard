import type { IconName } from '@/declarations/ui/icons'

/**
 * Someone writing in the Discord replica
 * @typedef {Object} DiscordAuthor
 * @property {string} id - Stable identifier
 * @property {string} name - Display name
 * @property {string | null} colour - Name colour
 * @property {boolean} [isApp] - Bot account
 * @property {IconName} [glyph] - Glyph standing in for the avatar
 */

export interface DiscordAuthor {
  id: string
  name: string
  colour: string | null
  isApp?: boolean
  glyph?: IconName
}

/**
 * One embed under a message
 * @typedef {Object} DiscordEmbed
 * @property {string | null} accent - Left bar colour
 * @property {boolean} [banner] - Image drawn as a skeleton
 * @property {string} [title] - Bold title
 * @property {string} [description] - Markdown body
 * @property {IconName} [thumbnail] - Glyph on the right
 * @property {string} [footer] - Small line below
 */

export interface DiscordEmbed {
  accent: string | null
  banner?: boolean
  title?: string
  description?: string
  thumbnail?: IconName
  footer?: string
}

/**
 * One button under a message
 * @typedef {Object} DiscordButton
 * @property {string} label - Button text
 * @property {'danger' | 'primary' | 'secondary' | 'success'} style - Discord button style
 * @property {IconName} [glyph] - Glyph before the label
 */

export interface DiscordButton {
  label: string
  style: 'danger' | 'primary' | 'secondary' | 'success'
  glyph?: IconName
}

/**
 * One message of the replica
 * @typedef {Object} DiscordReplicaMessage
 * @property {string} id - Stable identifier
 * @property {DiscordAuthor} author - Who writes
 * @property {string} time - Clock shown next to the name
 * @property {string} [content] - Markdown text
 * @property {DiscordEmbed[]} [embeds] - Embeds below
 * @property {DiscordButton[]} [buttons] - Buttons below
 * @property {string} [replyTo] - Message quoted above
 */

export interface DiscordReplicaMessage {
  id: string
  author: DiscordAuthor
  time: string
  content?: string
  embeds?: DiscordEmbed[]
  buttons?: DiscordButton[]
  replyTo?: string
}

/**
 * One channel of the sidebar
 * @typedef {Object} DiscordChannel
 * @property {string} name - Channel name
 * @property {'text' | 'announce' | 'rules'} kind - Glyph before it
 * @property {boolean} [lit] - Shines pink
 */

export interface DiscordChannel {
  name: string
  kind: 'text' | 'announce' | 'rules'
  lit?: boolean
}

/**
 * One category of the sidebar
 * @typedef {Object} DiscordCategory
 * @property {string} name - Category name
 * @property {DiscordChannel[]} channels - Visible channels
 * @property {number} [skeletons] - Grey bars standing for the others
 */

export interface DiscordCategory {
  name: string
  channels: DiscordChannel[]
  skeletons?: number
}

/**
 * One role group of the member list
 * @typedef {Object} DiscordMemberGroup
 * @property {string} role - Group title
 * @property {DiscordAuthor[]} members - Members drawn
 * @property {number} [skeletons] - Grey rows standing for the others
 */

export interface DiscordMemberGroup {
  role: string
  members: DiscordAuthor[]
  skeletons?: number
}

/**
 * Everything the Discord replica draws
 * @typedef {Object} DiscordReplicaState
 */

export interface DiscordReplicaState {
  server: string
  categories: DiscordCategory[]
  channel: string | null
  messages: DiscordReplicaMessage[]
  typing: DiscordAuthor[]
  // Text being typed in the composer
  draft: string
  memberGroups: DiscordMemberGroup[]
  // Role names a mention may name
  roles: Record<string, { name: string; colour: string }>
  // Step of the support guide in force
  guideStep: number | null
}

/**
 * One thing a Discord scene makes happen
 * @typedef {Object} DiscordSceneEvent
 */

export type DiscordSceneEvent =
  | { kind: 'open'; category: string; channel: DiscordChannel }
  | { kind: 'message'; message: DiscordReplicaMessage }
  | { kind: 'typing'; author: DiscordAuthor; on: boolean }
  | { kind: 'draft'; text: string }
  | { kind: 'guide'; step: number | null }

/**
 * One timed beat
 * @typedef {Object} DiscordSceneStep
 * @property {number} at - Milliseconds from the start
 * @property {DiscordSceneEvent} event - What happens
 */

export interface DiscordSceneStep {
  at: number
  event: DiscordSceneEvent
}

/**
 * A scripted Discord channel
 * @typedef {Object} DiscordScene
 * @property {DiscordReplicaState} initial - State at the start
 * @property {DiscordSceneStep[]} steps - Beats in time order
 */

export interface DiscordScene {
  initial: DiscordReplicaState
  steps: DiscordSceneStep[]
}
