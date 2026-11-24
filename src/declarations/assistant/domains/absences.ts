import { defineDomain } from '@/declarations/assistant/domains/types'
import { ASSISTANT_ABSENCE_MODES, CREATE_VERBS } from '@/declarations/assistant/lexicon/shared'
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
  summary: 'Je pose, décale, supprime ou liste tes absences.',
  intents: {
    absence: {
      label: 'Gérer une absence',
      kind: 'scenario',
      verbs: ABSENCE_VERBS,
      nouns: ['absence', 'absences', 'conge', 'conges', 'vacances', 'absent', 'indisponible'],
      needs: 'both',
      permission: Permissions.AbsenceCreate,
      pages: [ROUTES.absences],
      examples: [
        'Je pars en vacances du 3 au 14 décembre',
        'Décale mon absence',
        'Liste mes absences',
      ],
    },
  },
})
