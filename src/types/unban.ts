import type { IntegrationCreator } from '@/types/onboarding'
import type { UnbanStatusName } from '@/utils/constants/unban'
import type { UnbanActionName } from '@/core/lib/unban/actions'
import type { UnbanAnswer, UnbanFormSnapshot } from '@/declarations/unban/form'

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
}

/**
 * What the person is told once the request is filed
 * @typedef {Object} SubmitOutcome
 * @property {string} reference - Short code of the request
 */

export interface SubmitOutcome {
  reference: string
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

/**
 * Member shown beside a request
 * @typedef {Object} UnbanPerson
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} avatarUrl - Avatar
 */

export interface UnbanPerson {
  id: string
  name: string
  avatarUrl: string | null
}

/**
 * Request as a list row
 * @typedef {Object} UnbanRequestItem
 * @property {string} id - Request identifier
 * @property {string} reference - Short code
 * @property {UnbanStatusName} status - Where it stands
 * @property {string} youtuberId - Creator it belongs to
 * @property {string} youtuberName - Name of that creator
 * @property {string} discordId - Discord account of the requester
 * @property {string} discordName - Discord name of the requester
 * @property {string | null} discordAvatar - Discord avatar of the requester
 * @property {UnbanPerson | null} assignee - Member in charge
 * @property {string} submittedAt - ISO submission
 * @property {string} statusChangedAt - ISO last change of status
 */

export interface UnbanRequestItem {
  id: string
  reference: string
  status: UnbanStatusName
  youtuberId: string
  youtuberName: string
  discordId: string
  discordName: string
  discordAvatar: string | null
  assignee: UnbanPerson | null
  submittedAt: string
  statusChangedAt: string
}

/**
 * One page of requests
 * @typedef {Object} UnbanRequestPage
 * @property {UnbanRequestItem[]} items - Requests, newest first
 * @property {string | null} nextCursor - Cursor of the next page, null at the end
 */

export interface UnbanRequestPage {
  items: UnbanRequestItem[]
  nextCursor: string | null
}

/**
 * Opinion of the moderators on a request
 * @typedef {Object} UnbanVoteSummary
 * @property {number} voters - Moderators who voted
 * @property {boolean} canVote - The caller may give an opinion now
 * @property {'FOR' | 'AGAINST' | null} mine - Side the caller took
 * @property {number | null} forCount - Votes for, hidden from the one who decides
 * @property {number | null} againstCount - Votes against, hidden from the one who decides
 */

export interface UnbanVoteSummary {
  voters: number
  canVote: boolean
  mine: 'FOR' | 'AGAINST' | null
  forCount: number | null
  againstCount: number | null
}

/**
 * Request with everything the team reads
 * @typedef {Object} UnbanRequestDetail
 * @property {number} version - Counter the next write must quote
 * @property {UnbanAnswer[]} answers - Answers as given
 * @property {{ id: string, number: number }} formVersion - Version the requester filled
 * @property {number} activeFormNumber - Version served now
 * @property {string | null} reviewNote - Answer shown to the requester
 * @property {string | null} decidedAt - ISO decision
 * @property {UnbanPerson | null} decidedBy - Member who decided
 * @property {string | null} discordLiftedAt - ISO confirmation of the lift on Discord
 * @property {UnbanPerson | null} discordLiftedBy - Member who confirmed it
 * @property {UnbanVoteSummary} votes - Opinion of the moderators
 * @property {UnbanActionName[]} actions - What the caller may do to it
 */

export interface UnbanRequestDetail extends UnbanRequestItem {
  version: number
  answers: UnbanAnswer[]
  formVersion: { id: string; number: number }
  activeFormNumber: number
  reviewNote: string | null
  decidedAt: string | null
  decidedBy: UnbanPerson | null
  discordLiftedAt: string | null
  discordLiftedBy: UnbanPerson | null
  votes: UnbanVoteSummary
  actions: UnbanActionName[]
}
