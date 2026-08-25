import type { SanctionKindName } from '@/utils/constants/moderation'

/**
 * One measure of the graduated ladder
 * @typedef {Object} SanctionMeasureSeed
 * @property {string} name - Display name
 * @property {SanctionKindName} kind - Nature of the measure
 * @property {number | null} durationMinutes - Timeout length
 * @property {boolean} permanent - Never lifts on its own
 * @property {number} weight - Position on the severity scale
 * @property {string} accent - Tone driving the badge colour
 */

export interface SanctionMeasureSeed {
  name: string
  kind: SanctionKindName
  durationMinutes: number | null
  permanent: boolean
  weight: number
  accent: string
}

/**
 * The measures every panel picks from, ordered from lightest to heaviest
 * @type {readonly SanctionMeasureSeed[]}
 */

export const SANCTION_MEASURE_TEMPLATE: readonly SanctionMeasureSeed[] = [
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
    name: 'TO : 10 minutes',
    kind: 'TIMEOUT',
    durationMinutes: 10,
    permanent: false,
    weight: 30,
    accent: 'caution',
  },
  {
    name: 'TO : 1 heure',
    kind: 'TIMEOUT',
    durationMinutes: 60,
    permanent: false,
    weight: 40,
    accent: 'caution',
  },
  {
    name: 'TO : 5 heures',
    kind: 'TIMEOUT',
    durationMinutes: 300,
    permanent: false,
    weight: 50,
    accent: 'caution',
  },
  {
    name: 'TO : 12 heures',
    kind: 'TIMEOUT',
    durationMinutes: 720,
    permanent: false,
    weight: 60,
    accent: 'caution',
  },
  {
    name: 'TO : 1 jour',
    kind: 'TIMEOUT',
    durationMinutes: 1440,
    permanent: false,
    weight: 70,
    accent: 'warning',
  },
  {
    name: 'TO : 3 jours',
    kind: 'TIMEOUT',
    durationMinutes: 4320,
    permanent: false,
    weight: 80,
    accent: 'warning',
  },
  {
    name: 'TO : 7 jours',
    kind: 'TIMEOUT',
    durationMinutes: 10080,
    permanent: false,
    weight: 90,
    accent: 'warning',
  },
  {
    name: 'TO : 14 jours',
    kind: 'TIMEOUT',
    durationMinutes: 20160,
    permanent: false,
    weight: 95,
    accent: 'danger',
  },
  {
    name: 'Bannissement définitif',
    kind: 'BAN',
    durationMinutes: null,
    permanent: true,
    weight: 100,
    accent: 'danger',
  },
]

/**
 * Measure lookup by name, the ladder of an offence naming its rungs
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
