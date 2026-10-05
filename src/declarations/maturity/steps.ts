import { ROUTES } from '@/declarations/navigation'

/**
 * Checked feature steps
 * @typedef {Object} FeatureSteps
 * @property {string[]} done - Shipped
 * @property {string[]} todo - Still to build
 */

export interface FeatureSteps {
  done: string[]
  todo: string[]
}

/**
 * Steps of pages still in Dev
 * @type {Partial<Record<string, FeatureSteps>>}
 */

export const ROUTE_STEPS: Partial<Record<string, FeatureSteps>> = {
  [ROUTES.dashboard]: {
    done: ['Salutation personnelle', 'Appels de présence à confirmer', 'Annonce des nouveautés'],
    todo: ['Tes tâches du jour', 'Tes prochaines réunions', 'Tes absences à venir'],
  },
  [ROUTES.analytics]: {
    done: ['Page réservée à la section système'],
    todo: ['Propriété Google Analytics raccordée', 'Audience affichée'],
  },
}

/**
 * Share done of a Dev feature
 * @param {FeatureSteps} [steps] - Declared steps
 * @return {number | null} - Whole percent or null
 */

export const stepsProgress = (steps?: FeatureSteps): number | null => {
  if (!steps) return null

  const total = steps.done.length + steps.todo.length

  return total === 0 ? null : Math.round((steps.done.length / total) * 100)
}
