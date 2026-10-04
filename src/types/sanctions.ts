import type {
  SanctionGravityName,
  SanctionKindName,
  SanctionPanelName,
} from '@/utils/constants/moderation'

/**
 * One measure a ladder step may apply
 * @typedef {Object} SanctionMeasureView
 * @property {string} id - Measure identifier
 * @property {string} name - Display name
 * @property {SanctionKindName} kind - Nature
 * @property {number | null} durationMinutes - Timeout length
 * @property {boolean} permanent - Never lifts on its own
 * @property {string | null} accent - Tone
 * @property {number} weight - Position on the severity scale
 */

export interface SanctionMeasureView {
  id: string
  name: string
  kind: SanctionKindName
  durationMinutes: number | null
  permanent: boolean
  accent: string | null
  weight: number
}

/**
 * One step of a ladder, a condition and the measures applied together
 * @typedef {Object} SanctionRungView
 * @property {string} id - Step identifier
 * @property {number} step - Zero-based position
 * @property {string | null} condition - When it applies
 * @property {SanctionMeasureView[]} measures - Measures applied together
 */

export interface SanctionRungView {
  id: string
  step: number
  condition: string | null
  measures: SanctionMeasureView[]
}

/**
 * Tile of one offence on a panel, read at one level
 * @typedef {Object} SanctionOffenseCard
 * @property {string} id - Offence identifier
 * @property {string} name - Display name
 * @property {SanctionGravityName} gravity - Weight at the level on screen
 * @property {SanctionRungView | null} firstRung - What applies on sight
 * @property {number} rungCount - Steps of the ladder
 * @property {SanctionRungView[]} rungs - Every step at that level
 * @property {string[]} examples - Messages it covers, for the search
 */

export interface SanctionOffenseCard {
  id: string
  name: string
  gravity: SanctionGravityName
  firstRung: SanctionRungView | null
  rungCount: number
  rungs: SanctionRungView[]
  examples: string[]
}

/**
 * One offence in full, every level included
 * @typedef {Object} SanctionOffenseDetail
 * @property {string} id - Offence identifier
 * @property {SanctionPanelName} panel - Surface
 * @property {string} name - Display name
 * @property {string | null} summary - What it covers, markdown
 * @property {string[]} examples - Messages to moderate
 * @property {string[]} tolerated - Close messages left alone
 * @property {string | null} warningExample - Reason a moderator can paste
 * @property {Record<string, SanctionGravityName>} gravities - Weight per level identifier
 * @property {Record<string, SanctionRungView[]>} ladders - Steps per level identifier
 */

export interface SanctionOffenseDetail {
  id: string
  panel: SanctionPanelName
  name: string
  summary: string | null
  examples: string[]
  tolerated: string[]
  warningExample: string | null
  gravities: Record<string, SanctionGravityName>
  ladders: Record<string, SanctionRungView[]>
}

/**
 * Panel of one creator on one surface, read at one level
 * @typedef {Object} SanctionPanelView
 * @property {string} youtuberId - Creator
 * @property {SanctionPanelName} panel - Surface
 * @property {string | null} levelId - Level read
 * @property {SanctionOffenseCard[]} offenses - Tiles
 */

export interface SanctionPanelView {
  youtuberId: string
  panel: SanctionPanelName
  levelId: string | null
  offenses: SanctionOffenseCard[]
}

/**
 * One step a manager wants to persist
 * @typedef {Object} SanctionRungInput
 * @property {string | null} condition - When it applies
 * @property {string[]} measureIds - Measures applied together
 */

export interface SanctionRungInput {
  condition: string | null
  measureIds: string[]
}
