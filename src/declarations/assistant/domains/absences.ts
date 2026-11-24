import { defineDomain } from '@/declarations/assistant/domains/types'
import {
  ABSENCE_NOUNS,
  ASSISTANT_ABSENCE_MODES,
  CREATE_VERBS,
} from '@/declarations/assistant/lexicon/shared'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

// Verbs that start an absence
const ABSENCE_VERBS = [
  ...CREATE_VERBS,
  'pose',
  'poser',
  'poses',
  'declare',
  'declarer',
  'prends',
  'prendre',
  'mets',
  'mettre',
  'signale',
  'signaler',
  'pars',
  'part',
  'partir',
  'suis',
  'serai',
  'vais',
  'absente',
  ...ASSISTANT_ABSENCE_MODES.edit,
  ...ASSISTANT_ABSENCE_MODES.delete,
  ...ASSISTANT_ABSENCE_MODES.list,
] as const

/**
 * Absences
 * @type {DomainDef}
 */

export const ABSENCES = defineDomain({
  label: 'Absences',
  summary:
    'Je pose, décale, supprime ou liste tes absences, et je valide ou refuse celles de ton équipe.',
  intents: {
    absence: {
      label: 'Gérer une absence',
      kind: 'scenario',
      verbs: ABSENCE_VERBS,
      nouns: [...ABSENCE_NOUNS, 'absent', 'indisponible'],
      needs: 'both',
      permission: Permissions.AbsenceCreate,
      pages: [ROUTES.absences],
      examples: [
        'Je pars en vacances du 3 au 14 décembre',
        'Décale mon absence',
        'Liste mes absences',
      ],
    },
    approveAbsence: {
      label: 'Valider une absence',
      kind: 'act',
      verbs: ['valide', 'valider', 'valides', 'accepte', 'accepter', 'approuve', 'approuver'],
      nouns: ABSENCE_NOUNS,
      needs: 'both',
      boost: 15,
      permission: Permissions.AbsenceReview,
      pages: [ROUTES.absences],
      examples: ['Valide l’absence de Léa', 'Accepte l’absence de Procy'],
    },
    refuseAbsence: {
      label: 'Refuser une absence',
      kind: 'act',
      verbs: ['refuse', 'refuser', 'refuses', 'rejette', 'rejeter', 'decline', 'declines'],
      nouns: ABSENCE_NOUNS,
      needs: 'both',
      boost: 15,
      permission: Permissions.AbsenceReview,
      pages: [ROUTES.absences],
      examples: ['Refuse l’absence de Procy', 'Rejette ce congé'],
    },
  },
})
