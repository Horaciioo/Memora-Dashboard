import { OutcomeNames } from '@/declarations/reference/fixed'
import { AnswerAppreciations, RecruitmentOwners } from '@/utils/constants/recruitment'
import type { AnswerAppreciationName } from '@/utils/constants/recruitment'

/**
 * Step every campaign closes on — the moment the integration form is handed out.
 * Declared here rather than in the trame so no campaign can lose it
 * @type {{ title: string, description: string, owner: RecruitmentOwnerName, required: boolean }}
 */

export const INTEGRATION_STEP = {
  title: 'Générer le lien',
  description: 'À la fin de la réunion d’information collective, le formulaire part aux validés.',
  owner: RecruitmentOwners.Responsable,
  required: true,
} as const

/**
 * Verdicts closing an interview, in display order, with their button and tone
 * @type {readonly { outcome: string, label: string, tone: AnswerAppreciationName }[]}
 */

export const DELIBERATION_VERDICTS: readonly {
  outcome: string
  label: string
  tone: AnswerAppreciationName
}[] = [
  { outcome: OutcomeNames.Favorable, label: 'Avis favorable', tone: AnswerAppreciations.Like },
  { outcome: OutcomeNames.Mixed, label: 'Avis mitigé', tone: AnswerAppreciations.Neutral },
  {
    outcome: OutcomeNames.Unfavorable,
    label: 'Avis défavorable',
    tone: AnswerAppreciations.Dislike,
  },
]

/**
 * Headings the issues are sorted under
 * @type {Record<string, string>}
 */

export const OUTCOME_GROUPS = {
  ongoing: 'En cours',
  final: 'Décision finale',
} as const
