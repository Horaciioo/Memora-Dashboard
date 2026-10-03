import type { LegacyOutcome } from '@/core/lib/legacy/scoring'
import type { LegacyStatusName } from '@/utils/constants/hierarchy'

/**
 * One module of a track with what it earned
 * @typedef {Object} LegacyModuleView
 * @property {string} key - Module key
 * @property {string} name - Title
 * @property {string} summary - What it teaches
 * @property {number} minutes - Expected length
 * @property {number} exercises - Exercises of the module
 * @property {number} cleared - Exercises cleared
 * @property {number} auto - Points from the exercises
 * @property {number | null} evaluator - Evaluator's note, none before it is given
 * @property {number} total - Points once the evaluator's note is in
 * @property {boolean} passed - Reaches the pass mark
 * @property {string | null} gradedByName - Who gave the note
 */

export interface LegacyModuleView {
  key: string
  name: string
  summary: string
  minutes: number
  exercises: number
  cleared: number
  auto: number
  evaluator: number | null
  total: number
  passed: boolean
  gradedByName: string | null
}

/**
 * Track as the list shows it
 * @typedef {Object} LegacyTrackSummary
 * @property {string} id - Track identifier
 * @property {string} accountId - Member following it
 * @property {string} memberName - Member name
 * @property {string | null} avatarUrl - Member portrait
 * @property {string | null} functionName - Trade they will lead
 * @property {string} startsAt - ISO start
 * @property {string} endsAt - ISO end
 * @property {LegacyStatusName} status - Where it stands
 * @property {string | null} decidedAt - ISO day it was decided
 * @property {string | null} decidedByName - Who decided
 * @property {LegacyOutcome} outcome - Standing against the thresholds
 */

export interface LegacyTrackSummary {
  id: string
  accountId: string
  memberName: string
  avatarUrl: string | null
  functionName: string | null
  startsAt: string
  endsAt: string
  status: LegacyStatusName
  decidedAt: string | null
  decidedByName: string | null
  outcome: LegacyOutcome
}

/**
 * Track with its modules
 * @typedef {Object} LegacyTrackDetail
 * @property {LegacyTrackSummary} summary - Track
 * @property {LegacyModuleView[]} modules - Modules in order
 */

export interface LegacyTrackDetail {
  summary: LegacyTrackSummary
  modules: LegacyModuleView[]
}
