import type { RecapSectionName } from '@/declarations/recap/chapters'
import type { RecapTierName } from '@/declarations/recap/tiers'
import type { Tone } from '@/declarations/ui/theme'

/**
 * Kind of movement a recap reports
 * @type {string}
 */

export type RecapBeatName =
  | 'alert'
  | 'rollCallPresent'
  | 'rollCallAbsent'
  | 'comments'
  | 'edited'
  | 'pageShared'
  | 'absencesWaiting'

/**
 * How one kind of movement reads
 * @typedef {Object} RecapBeatOption
 * @property {RecapTierName} tier - Weight, an alert takes the one of its notification kind
 * @property {string} one - Line for a single actor, {who} stands for the names and **words** read first
 * @property {string} many - Line for several actors
 * @property {RecapSectionName} [section] - Part of its chapter it is told in
 * @property {boolean} [alone] - Always a line of its own, even beside others on the same record
 */

export interface RecapBeatOption {
  tier: RecapTierName
  one: string
  many: string
  section?: RecapSectionName
  alone?: boolean
}

/**
 * How every kind of movement reads
 * @type {Record<RecapBeatName, RecapBeatOption>}
 */

export const RECAP_BEATS: Record<RecapBeatName, RecapBeatOption> = {
  // Sentence comes from the notification kind
  alert: { tier: 'follow', one: '', many: '' },
  rollCallPresent: {
    tier: 'follow',
    section: 'rollCalls',
    alone: true,
    one: '{who} a répondu **présent** à l’événement',
    many: '{who} ont répondu **présent** à l’événement',
  },
  rollCallAbsent: {
    tier: 'follow',
    section: 'rollCalls',
    alone: true,
    one: '{who} a répondu **absent** à l’événement',
    many: '{who} ont répondu **absent** à l’événement',
  },
  comments: {
    tier: 'follow',
    one: '{who} a **commenté**',
    many: '{who} ont **commenté**',
  },
  edited: {
    tier: 'follow',
    one: '{who} a **modifié**',
    many: '{who} ont **modifié**',
  },
  pageShared: {
    tier: 'follow',
    one: '{who} a **partagé** une page avec toi',
    many: '{who} ont **partagé** une page avec toi',
  },
  absencesWaiting: {
    tier: 'act',
    one: '{who} a **déposé** une absence',
    many: '{who} ont **déposé** une absence',
  },
}

/**
 * How one tally reads, the count leading
 * @typedef {Object} RecapFigureOption
 * @property {Tone} tone - Colour
 * @property {string} one - Singular
 * @property {string} many - Plural
 */

export interface RecapFigureOption {
  tone: Tone
  one: string
  many: string
}

/**
 * Tallies a beat can carry
 * @type {Record<string, RecapFigureOption>}
 */

export const RECAP_FIGURES: Record<string, RecapFigureOption> = {
  comments: { tone: 'info', one: 'commentaire', many: 'commentaires' },
}

/**
 * Word that leads into the record title after the verb of an alert
 * @type {Record<string, string>}
 */

export const RECAP_ALERT_LEAD: Record<string, string> = {
  Mentioned: 'dans',
}
