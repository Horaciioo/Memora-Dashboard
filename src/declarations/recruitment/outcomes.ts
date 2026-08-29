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
 * The issues a recruitment starts with, freely edited from the admin console
 * afterwards — they are a starting point, never a fixed list
 * @type {readonly RecruitmentOutcomeSeed[]}
 */

export const RECRUITMENT_OUTCOME_TEMPLATE: readonly RecruitmentOutcomeSeed[] = [
  { name: 'À traiter', accent: '#64748b', isDefault: true, isTerminal: false },
  { name: 'Entretien posé', accent: '#0284c7', isDefault: false, isTerminal: false },
  { name: 'En délibération', accent: '#f59e0b', isDefault: false, isTerminal: false },
  { name: 'Accepté', accent: '#16a34a', isDefault: false, isTerminal: true },
  { name: 'Refusé', accent: '#dc2626', isDefault: false, isTerminal: true },
  { name: 'Désisté', accent: '#78716c', isDefault: false, isTerminal: true },
]
