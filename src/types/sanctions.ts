/**
 * One measure of the ladder as the panel renders it
 * @typedef {Object} SanctionMeasureView
 * @property {string} id - Measure identifier
 * @property {string} name - Display name
 * @property {string | null} accent - Tone token
 * @property {number} weight - Position on the severity scale
 */

export interface SanctionMeasureView {
  id: string
  name: string
  accent: string | null
  weight: number
}

/**
 * One rung of one offence inside one panel
 * @typedef {Object} SanctionTierView
 * @property {string} id - Tier identifier
 * @property {number} step - Zero-based rung
 * @property {string | null} note - Label overriding the declared step
 * @property {SanctionMeasureView} measure - Measure applied
 */

export interface SanctionTierView {
  id: string
  step: number
  note: string | null
  measure: SanctionMeasureView
}

/**
 * One offence as the grid renders it, titles only
 * @typedef {Object} SanctionOffenseCard
 * @property {string} id - Offence identifier
 * @property {string} name - Display name
 * @property {string | null} accent - Tone token
 * @property {string | null} peakAccent - Tone of the harshest rung of the open panel
 */

export interface SanctionOffenseCard {
  id: string
  name: string
  accent: string | null
  peakAccent: string | null
}

/**
 * One offence opened in full
 * @typedef {Object} SanctionOffenseDetail
 * @property {string} id - Offence identifier
 * @property {string} name - Display name
 * @property {string | null} summary - What the offence covers
 * @property {string | null} example - Concrete case
 * @property {string | null} warningExample - Reason a moderator can paste
 * @property {string | null} accent - Tone token
 * @property {Record<string, SanctionTierView[]>} ladders - Rungs per livecon level
 */

export interface SanctionOffenseDetail {
  id: string
  name: string
  summary: string | null
  example: string | null
  warningExample: string | null
  accent: string | null
  ladders: Record<string, SanctionTierView[]>
}

/**
 * The whole panel of one creator
 * @typedef {Object} SanctionPanelView
 * @property {string} youtuberId - Creator the panel belongs to
 * @property {string | null} activeLevelId - Level in force, the panel opened by default
 * @property {SanctionOffenseCard[]} offenses - Offence tiles
 */

export interface SanctionPanelView {
  youtuberId: string
  activeLevelId: string | null
  offenses: SanctionOffenseCard[]
}
