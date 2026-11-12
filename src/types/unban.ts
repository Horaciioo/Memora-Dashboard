import type { IntegrationCreator } from '@/types/onboarding'
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
 * What the public page learns from a token
 * @typedef {Object} PublicLinkContext
 * @property {string} linkId - Link identifier
 * @property {UnbanLinkStateName} state - Current state
 * @property {boolean} requiresAccount - A given Discord account is expected
 * @property {string} expiresAt - ISO expiry
 * @property {IntegrationCreator} creator - Creator it belongs to
 */

export interface PublicLinkContext {
  linkId: string
  state: UnbanLinkStateName
  requiresAccount: boolean
  expiresAt: string
  creator: IntegrationCreator
}

/**
 * One answer as the requester reads it back
 * @typedef {Object} PublicAnswerView
 * @property {string} label - Question asked
 * @property {string | null} text - Answer, null when left blank
 */

export interface PublicAnswerView {
  label: string
  text: string | null
}

/**
 * Everything a requester may know of their own request,
 * @typedef {Object} PublicRequestView
 * @property {string} reference - Short code
 * @property {UnbanStatusName} status - Where it stands
 * @property {string} statusLabel - Words for that status
 * @property {string} submittedAt - ISO submission
 * @property {string} updatedAt - ISO last change of status or decision
 * @property {string | null} decidedAt - ISO decision
 * @property {string | null} reviewNote - Answer of the team
 * @property {PublicAnswerView[]} answers - The requester's own answers
 * @property {string} youtuberName - Creator it was filed with
 * @property {string} linkExpiresAt - ISO expiry of the link
 */

export interface PublicRequestView {
  reference: string
  status: UnbanStatusName
  statusLabel: string
  submittedAt: string
  updatedAt: string
  decidedAt: string | null
  reviewNote: string | null
  answers: PublicAnswerView[]
  youtuberName: string
  linkExpiresAt: string
}

/**
 * What the person is told once the request is filed
 * @typedef {Object} SubmitOutcome
 * @property {string} reference - Short code of the request
 * @property {string} linkExpiresAt - ISO expiry of the link that follows it
 */

export interface SubmitOutcome {
  reference: string
  linkExpiresAt: string
}

/**
 * Account shown back to the person filing
 * @typedef {Object} UnbanIdentityView
 * @property {string} discordId - Discord identifier
 * @property {string} name - Display name
 * @property {string | null} avatarUrl - Portrait
 */

export interface UnbanIdentityView {
  discordId: string
  name: string
  avatarUrl: string | null
}
