import { RecruitmentOwners } from '@/utils/constants/recruitment'

/**
 * One column of the results board
 * @typedef {Object} RecruitmentOutcomeSeed
 * @property {string} name - Display name
 * @property {string} accent - Tone driving the badge colour
 * @property {boolean} isDefault - Column a new candidate lands in
 * @property {boolean} isTerminal - Closes the application
 */

export interface RecruitmentOutcomeSeed {
  name: string
  accent: string
  isDefault: boolean
  isTerminal: boolean
}

/**
 * The issues a recruitment starts with
 * @type {readonly RecruitmentOutcomeSeed[]}
 */

export const RECRUITMENT_OUTCOME_TEMPLATE: readonly RecruitmentOutcomeSeed[] = [
  { name: 'À traiter', accent: '#9fa8b3', isDefault: true, isTerminal: false },
  { name: 'Entretien posé', accent: '#6a9bd1', isDefault: false, isTerminal: false },
  { name: 'En délibération', accent: '#e3c25a', isDefault: false, isTerminal: false },
  { name: 'Accepté', accent: '#7dbf8e', isDefault: false, isTerminal: true },
  { name: 'Refusé', accent: '#e0867a', isDefault: false, isTerminal: true },
  { name: 'Désisté', accent: '#b9a58f', isDefault: false, isTerminal: true },
]

/**
 * Step every campaign closes on — the moment the integration form is handed out.
 * Declared here rather than in the trame so no campaign can lose it
 * @type {{ title: string, description: string, owner: RecruitmentOwnerName, required: boolean }}
 */

export const INTEGRATION_STEP = {
  title: 'Envoi du formulaire d’intégration',
  description: 'À la fin de la réunion d’information collective, le formulaire part aux validés.',
  owner: RecruitmentOwners.Responsable,
  required: true,
} as const
