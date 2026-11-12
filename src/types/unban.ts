import type { UnbanLinkStateName, UnbanStatusName } from '@/utils/constants/unban'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'

/**
 * Version of the Deban. form
 * @typedef {Object} UnbanFormVersionView
 * @property {string} id - Version identifier
 * @property {number} number - Version number
 * @property {UnbanFormSnapshot} snapshot - Questions as frozen
 * @property {string | null} publishedAt - ISO publication, null for the draft
 */

export interface UnbanFormVersionView {
  id: string
  number: number
  snapshot: UnbanFormSnapshot
  publishedAt: string | null
}

/**
 * Link as a moderator sees it, never carries the secret
 * @typedef {Object} UnbanLinkView
 * @property {string} id - Link identifier
 * @property {string} youtuberId - Creator it belongs to
 * @property {string} youtuberName - Name of that creator
 * @property {string | null} label - Note of the moderator
 * @property {string | null} expectedDiscordId - Only account allowed to open it
 * @property {UnbanLinkStateName} state - Current state
 * @property {boolean} isExpired - Past its expiry whatever its state
 * @property {string} expiresAt - ISO expiry
 * @property {string | null} usedAt - ISO first use
 * @property {string} createdAt - ISO creation
 * @property {{ reference: string, status: UnbanStatusName } | null} request - Request it produced
 */

export interface UnbanLinkView {
  id: string
  youtuberId: string
  youtuberName: string
  label: string | null
  expectedDiscordId: string | null
  state: UnbanLinkStateName
  isExpired: boolean
  expiresAt: string
  usedAt: string | null
  createdAt: string
  request: { reference: string; status: UnbanStatusName } | null
}

/**
 * Link just made, the only time its address exists
 * @typedef {Object} CreatedUnbanLink
 * @property {UnbanLinkView} link - Stored link
 * @property {string} path - Address to hand out, to prefix with the public origin
 */

export interface CreatedUnbanLink {
  link: UnbanLinkView
  path: string
}

/**
 * Creator shown on the public pages
 * @typedef {Object} UnbanCreator
 * @property {string} name - Display name
 * @property {string | null} avatarUrl - Avatar
 * @property {string | null} bannerUrl - Banner
 */

export interface UnbanCreator {
  name: string
  avatarUrl: string | null
  bannerUrl: string | null
}

/**
 * What the public page learns from a token
 * @typedef {Object} PublicLinkContext
 * @property {string} linkId - Link identifier
 * @property {UnbanLinkStateName} state - Current state
 * @property {boolean} requiresAccount - A given Discord account is expected
 * @property {string} expiresAt - ISO expiry
 * @property {UnbanCreator} creator - Creator it belongs to
 */

export interface PublicLinkContext {
  linkId: string
  state: UnbanLinkStateName
  requiresAccount: boolean
  expiresAt: string
  creator: UnbanCreator
}
