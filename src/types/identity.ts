import type { IntegrationCreator } from '@/types/onboarding'
import type { IdentityCheckStatusName } from '@/utils/constants/identity'

/**
 * Seat an accepted candidate waits on
 * @typedef {Object} PendingSeat
 * @property {string} juniorId - Junior seat
 * @property {string} accountId - Pre-generated account
 * @property {string} sessionName - Promotion name
 * @property {string} functionName - Function trained for
 * @property {IntegrationCreator | null} creator - Creator who recruited
 */

export interface PendingSeat {
  juniorId: string
  accountId: string
  sessionName: string
  functionName: string
  creator: IntegrationCreator | null
}

/**
 * What the welcome screen knows about one check
 * @typedef {Object} IdentityCheckView
 * @property {string} id - Check identifier
 * @property {IdentityCheckStatusName} status - Where it stands
 * @property {string} discordId - Identity Discord proved
 * @property {string} name - Discord handle
 * @property {string | null} avatarUrl - Discord portrait
 * @property {PendingSeat | null} seat - Seat found for this identity
 * @property {number} attempts - Pseudonyms already typed
 */

export interface IdentityCheckView {
  id: string
  status: IdentityCheckStatusName
  discordId: string
  name: string
  avatarUrl: string | null
  seat: PendingSeat | null
  attempts: number
}

/**
 * Candidate a responsable may attach an identifier to
 * @typedef {Object} IdentityCandidate
 * @property {string} id - Application identifier
 * @property {string} name - Pseudonym given at application
 * @property {string} sessionName - Recruitment session
 */

export interface IdentityCandidate {
  id: string
  name: string
  sessionName: string
}

/**
 * Open escalation a responsable handles
 * @typedef {Object} IdentityEscalation
 * @property {string} id - Check identifier
 * @property {string | null} typedName - Pseudonym the person typed
 * @property {string | null} candidateId - Application the pseudonym points at
 * @property {IdentityCandidate[]} choices - Applications one may attach
 */

export interface IdentityEscalation {
  id: string
  typedName: string | null
  candidateId: string | null
  choices: IdentityCandidate[]
}

/**
 * Identity a responsable typed, as far as Memora knows it
 * @typedef {Object} IdentityPreview
 * @property {string} discordId - Typed identifier
 * @property {string} name - Name shown
 * @property {string | null} avatarUrl - Portrait shown
 */

export interface IdentityPreview {
  discordId: string
  name: string
  avatarUrl: string | null
}
