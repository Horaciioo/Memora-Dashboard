import type { SanctionKindName, SanctionPanelName } from '@/utils/constants/moderation'

/**
 * One measure of the graduated ladder
 * @typedef {Object} SanctionMeasureSeed
 * @property {string} name - Display name
 * @property {SanctionKindName} kind - Nature of the measure
 * @property {number | null} durationMinutes - Timeout length
 * @property {boolean} permanent - Never lifts on its own
 * @property {number} weight - Position on the severity scale
 * @property {string} accent - Tone driving the badge colour
 * @property {readonly SanctionPanelName[]} [panels] - Surfaces using it, all when absent
 */

export interface SanctionMeasureSeed {
  name: string
  kind: SanctionKindName
  durationMinutes: number | null
  permanent: boolean
  weight: number
  accent: string
  panels?: readonly SanctionPanelName[]
}

// Surfaces of a live
const LIVE_PANELS: readonly SanctionPanelName[] = ['TWITCH', 'YOUTUBE']

// Surface of the server
const DISCORD_PANELS: readonly SanctionPanelName[] = ['DISCORD']

/**
 * The measures every panel picks from
 * @type {readonly SanctionMeasureSeed[]}
 */

export const SANCTION_MEASURE_TEMPLATE: readonly SanctionMeasureSeed[] = [
  {
    name: 'Aucune action',
    kind: 'NONE',
    durationMinutes: null,
    permanent: false,
    weight: 0,
    accent: 'neutral',
  },
  {
    name: 'Commentaire',
    kind: 'COMMENT',
    durationMinutes: null,
    permanent: false,
    weight: 5,
    accent: 'neutral',
  },
  {
    name: 'Suppression',
    kind: 'DELETE',
    durationMinutes: null,
    permanent: false,
    weight: 10,
    accent: 'success',
  },
  {
    name: 'Avertissement',
    kind: 'WARN',
    durationMinutes: null,
    permanent: false,
    weight: 20,
    accent: 'success',
  },
  {
    name: 'TO : 5 minutes',
    kind: 'TIMEOUT',
    durationMinutes: 5,
    permanent: false,
    weight: 25,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 10 minutes',
    kind: 'TIMEOUT',
    durationMinutes: 10,
    permanent: false,
    weight: 30,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 30 minutes',
    kind: 'TIMEOUT',
    durationMinutes: 30,
    permanent: false,
    weight: 35,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 1 heure',
    kind: 'TIMEOUT',
    durationMinutes: 60,
    permanent: false,
    weight: 40,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 5 heures',
    kind: 'TIMEOUT',
    durationMinutes: 300,
    permanent: false,
    weight: 50,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 12 heures',
    kind: 'TIMEOUT',
    durationMinutes: 720,
    permanent: false,
    weight: 60,
    accent: 'caution',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 1 jour',
    kind: 'TIMEOUT',
    durationMinutes: 1440,
    permanent: false,
    weight: 70,
    accent: 'warning',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 3 jours',
    kind: 'TIMEOUT',
    durationMinutes: 4320,
    permanent: false,
    weight: 80,
    accent: 'warning',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 7 jours',
    kind: 'TIMEOUT',
    durationMinutes: 10080,
    permanent: false,
    weight: 90,
    accent: 'warning',
    panels: LIVE_PANELS,
  },
  {
    name: 'TO : 14 jours',
    kind: 'TIMEOUT',
    durationMinutes: 20160,
    permanent: false,
    weight: 95,
    accent: 'danger',
    panels: LIVE_PANELS,
  },
  {
    name: 'Mute : 30 minutes',
    kind: 'TIMEOUT',
    durationMinutes: 30,
    permanent: false,
    weight: 35,
    accent: 'caution',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Mute : 2 heures',
    kind: 'TIMEOUT',
    durationMinutes: 120,
    permanent: false,
    weight: 45,
    accent: 'caution',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Mute : 4 heures',
    kind: 'TIMEOUT',
    durationMinutes: 240,
    permanent: false,
    weight: 48,
    accent: 'caution',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Mute : 12 heures',
    kind: 'TIMEOUT',
    durationMinutes: 720,
    permanent: false,
    weight: 60,
    accent: 'caution',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Mute : 1 jour',
    kind: 'TIMEOUT',
    durationMinutes: 1440,
    permanent: false,
    weight: 70,
    accent: 'warning',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Mute : 7 jours',
    kind: 'TIMEOUT',
    durationMinutes: 10080,
    permanent: false,
    weight: 90,
    accent: 'warning',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Expulsion',
    kind: 'BAN',
    durationMinutes: null,
    permanent: false,
    weight: 92,
    accent: 'warning',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Ban : 7 jours',
    kind: 'BAN',
    durationMinutes: 10080,
    permanent: false,
    weight: 96,
    accent: 'danger',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Ban : 30 jours',
    kind: 'BAN',
    durationMinutes: 43200,
    permanent: false,
    weight: 97,
    accent: 'danger',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Ban : 90 jours',
    kind: 'BAN',
    durationMinutes: 129600,
    permanent: false,
    weight: 98,
    accent: 'danger',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Ban : 1 an',
    kind: 'BAN',
    durationMinutes: 525600,
    permanent: false,
    weight: 99,
    accent: 'danger',
    panels: DISCORD_PANELS,
  },
  {
    name: 'Bannissement définitif',
    kind: 'BAN',
    durationMinutes: null,
    permanent: true,
    weight: 100,
    accent: 'danger',
  },
  {
    name: 'Signalement',
    kind: 'REPORT',
    durationMinutes: null,
    permanent: false,
    weight: 101,
    accent: 'info',
    panels: LIVE_PANELS,
  },
]

/**
 * Measure lookup by name
 * @type {Map<string, SanctionMeasureSeed>}
 */

const MEASURE_INDEX = new Map(SANCTION_MEASURE_TEMPLATE.map((entry) => [entry.name, entry]))

/**
 * Read a declared measure
 * @param {string} name - Measure name
 * @return {SanctionMeasureSeed | undefined} - Measure
 */

export const measureSeed = (name: string): SanctionMeasureSeed | undefined =>
  MEASURE_INDEX.get(name)

/**
 * Measures a surface lists in its legend
 * @param {SanctionPanelName} panel - Surface
 * @return {SanctionMeasureSeed[]} - Measures by severity
 */

export const legendOf = (panel: SanctionPanelName): SanctionMeasureSeed[] =>
  SANCTION_MEASURE_TEMPLATE.filter(
    (entry) =>
      entry.kind !== 'NONE' && entry.kind !== 'REPORT' && (entry.panels?.includes(panel) ?? true)
  ).sort((left, right) => left.weight - right.weight)
