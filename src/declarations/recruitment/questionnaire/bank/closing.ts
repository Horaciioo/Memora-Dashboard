import type { QuestionDefinition } from '@/declarations/recruitment/questionnaire/types'

/**
 * Questions closing the interview
 * @type {readonly QuestionDefinition[]}
 */

export const CLOSING_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'closing.availability',
    part: 'closing',
    section: 'wrap',
    kind: 'open',
    mandatory: true,
    minutes: 2,
    prompt: 'Quelles sont tes disponibilités réelles, chaque semaine, pour modérer ?',
    hint: 'Croise avec ce qu’il t’a dit de son travail ou de ses études.',
  },
  {
    key: 'closing.questions',
    part: 'closing',
    section: 'wrap',
    kind: 'open',
    recommended: true,
    minutes: 2,
    prompt: 'As-tu des questions pour nous ?',
    hint: 'La qualité de ses questions dit beaucoup de sa motivation.',
  },
  {
    key: 'closing.next',
    part: 'closing',
    section: 'wrap',
    kind: 'open',
    recommended: true,
    minutes: 1,
    prompt: 'As-tu bien compris la suite du processus ?',
    say: 'Voici la suite : la délibération, puis la réponse, puis, si tu es retenu(e), la réunion d’information collective.',
    hint: 'Annonce le délai de réponse annoncé à la session, sans rien promettre.',
  },
]
