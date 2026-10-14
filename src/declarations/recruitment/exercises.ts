import type { ExerciseKey } from '@/declarations/recruitment/questionnaire/types'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Exercise of the practical part
 * @typedef {Object} ExerciseOption
 * @property {string} label - Name on the card and in the trail
 * @property {string} lead - What it measures
 * @property {IconName} icon - Glyph on the card
 * @property {boolean} cutsOff - Moves on by itself when time is up
 * @property {boolean} [isDevOnly] - Offered on the dev branch only
 */

export interface ExerciseOption {
  label: string
  lead: string
  icon: IconName
  cutsOff: boolean
  isDevOnly?: boolean
}

/**
 * Exercises of the practical part
 * @type {Record<ExerciseKey, ExerciseOption>}
 */

export const EXERCISES: Record<ExerciseKey, ExerciseOption> = {
  sixty: {
    label: 'Les 60 secondes',
    lead: 'Des questions rapides, une réponse en quelques secondes.',
    icon: 'clock',
    cutsOff: true,
  },
  written: {
    label: 'Les contextes écrits',
    lead: 'Il regarde une situation se jouer, puis écrit son message.',
    icon: 'note',
    cutsOff: false,
  },
  cases: {
    label: 'Les cas d’étude',
    lead: 'Un cas complet à analyser, à débattre et à trancher.',
    icon: 'sheet',
    cutsOff: false,
  },
  documents: {
    label: 'Documents d’étude',
    lead: 'Des documents à lire et à commenter.',
    icon: 'sheet',
    cutsOff: false,
    isDevOnly: true,
  },
}

/**
 * Exercises in showing order
 * @type {ExerciseKey[]}
 */

export const EXERCISE_ORDER: ExerciseKey[] = ['sixty', 'written', 'documents', 'cases']
