import type { IntegrationLinkKindName } from '@/utils/constants/integration'

/**
 * Creator whose banner dresses the public form
 * @typedef {Object} IntegrationCreator
 * @property {string} id - Creator identifier
 * @property {string} name - Creator name
 * @property {string | null} accent - Colour token
 * @property {string | null} avatarUrl - Portrait URL
 * @property {string | null} bannerUrl - Horizontal banner URL
 */

export interface IntegrationCreator {
  id: string
  name: string
  accent: string | null
  avatarUrl: string | null
  bannerUrl: string | null
}

/**
 * Still-usable link, with enough of its targets to draw and answer the form
 * @typedef {Object} LiveInvite
 * @property {string} id - Link identifier
 * @property {IntegrationLinkKindName} kind - What a submission creates
 * @property {string | null} youtuberId - Creator the member joins
 * @property {string | null} functionId - Function the member takes
 * @property {number | null} maxUses - Seats the link opens
 * @property {Date} createdAt - Day the link was sent, kept as the arrival date
 * @property {IntegrationCreator | null} youtuber - Creator the banner comes from
 * @property {{ id: string, functionId: string, startsAt: Date } | null} session - Academy session
 */

export interface LiveInvite {
  id: string
  kind: IntegrationLinkKindName
  youtuberId: string | null
  functionId: string | null
  maxUses: number | null
  createdAt: Date
  youtuber: IntegrationCreator | null
  session: { id: string; functionId: string; startsAt: Date } | null
}

/**
 * Discord identity the server resolved for one link
 * @typedef {Object} IntegrationClaimView
 * @property {string} id - Claim identifier
 * @property {string} discordId - Discord identifier
 * @property {string | null} displayName - Discord handle
 * @property {string | null} avatarUrl - Discord portrait
 * @property {string | null} avatarHash - Stored portrait hash
 */

export interface IntegrationClaimView {
  id: string
  discordId: string
  displayName: string | null
  avatarUrl: string | null
  avatarHash: string | null
}

/**
 * The single link one campaign hands out
 * @typedef {Object} IntegrationLinkView
 * @property {string} id - Link identifier
 * @property {IntegrationLinkKindName} kind - What a submission creates
 * @property {string} token - Public token
 * @property {string} expiresAt - Expiry day
 * @property {number} uses - Seats already taken
 * @property {number | null} maxUses - Seats the link opens
 * @property {boolean} usable - Still open to a submission
 */

export interface IntegrationLinkView {
  id: string
  kind: IntegrationLinkKindName
  token: string
  expiresAt: string
  uses: number
  maxUses: number | null
  usable: boolean
}
