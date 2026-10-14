import type { ParkourPhase } from '@/core/lib/academy/parkour'
import { createRegistry } from '@/core/lib/registry'
import type { PimDestinationName } from '@/declarations/academy/guides'
import type { IconName } from '@/declarations/ui/icons'
import type { Tone } from '@/declarations/ui/theme'
import { StepOwners } from '@/utils/constants/hierarchy'
import type { StepOwnerName } from '@/utils/constants/hierarchy'

/**
 * Stretch of the PIM a moment belongs to
 * @typedef {'preparation' | 'periodOne' | 'periodTwo' | 'periodThree' | 'official'} PimPeriodName
 */

export type PimPeriodName = 'preparation' | 'periodOne' | 'periodTwo' | 'periodThree' | 'official'

/**
 * How one period reads on a timeline and on the calendar
 * @typedef {Object} PimPeriodOption
 * @property {string} label - Period name
 * @property {string} lead - What the period is for
 * @property {IconName} icon - Glyph
 * @property {Tone} tone - Colour family
 * @property {boolean} hasTrainings - Draws a trainings zone before its check-ins
 */

export interface PimPeriodOption {
  label: string
  lead: string
  icon: IconName
  tone: Tone
  hasTrainings: boolean
}

const PIM_PERIOD_MAP: Record<PimPeriodName, PimPeriodOption> = {
  preparation: {
    label: 'Préparation',
    lead: 'Le Formateur, le début de PIM et le formulaire d’intégration.',
    icon: 'link',
    tone: 'neutral',
    hasTrainings: false,
  },
  periodOne: {
    label: 'Période 1',
    lead: 'Découverte de Memora, des formations et des premiers lives.',
    icon: 'academy',
    tone: 'info',
    hasTrainings: true,
  },
  periodTwo: {
    label: 'Période 2',
    lead: 'Objectifs, spécialisations et nouveaux lives en tant que présent.',
    icon: 'objective',
    tone: 'brand',
    hasTrainings: true,
  },
  periodThree: {
    label: 'Période 3',
    lead: 'Une dernière période, si le Responsable l’accorde.',
    icon: 'clock',
    tone: 'caution',
    hasTrainings: false,
  },
  official: {
    label: 'Officialisation',
    lead: 'Modérateur, Division 1.',
    icon: 'star',
    tone: 'success',
    hasTrainings: false,
  },
}

export const PIM_PERIOD_REGISTRY = createRegistry(PIM_PERIOD_MAP)

/**
 * Moment of the PIM journey every junior goes through
 * @typedef {Object} ParkourMilestone
 * @property {string} key - Stable identifier
 * @property {PimPeriodName} period - Stretch it belongs to
 * @property {IconName} icon - Glyph
 * @property {string} label - Moment name
 * @property {string} lead - What happens
 * @property {StepOwnerName | null} owner - Who moves it forward, nobody when automatic
 * @property {ParkourPhase[]} phases - Phases during which this moment is in course
 * @property {PimDestinationName} [destination] - Where its owner acts
 * @property {boolean} [optional] - Only reached after a 3rd period
 */

export interface ParkourMilestone {
  key: string
  period: PimPeriodName
  icon: IconName
  label: string
  lead: string
  owner: StepOwnerName | null
  phases: ParkourPhase[]
  destination?: PimDestinationName
  optional?: boolean
}

/**
 * Moments of the PIM in running order, fixed in code
 * @type {readonly ParkourMilestone[]}
 */

export const PARKOUR_MILESTONES: readonly ParkourMilestone[] = [
  {
    key: 'trainer',
    period: 'preparation',
    icon: 'functionTrainer',
    label: 'Formateur attribué',
    lead: 'Un Formateur est attribué au Junior.',
    owner: StepOwners.Responsable,
    phases: ['needsTrainer'],
    destination: 'fsiTrainer',
  },
  {
    key: 'kickoff',
    period: 'preparation',
    icon: 'link',
    label: 'Début de PIM déclaré',
    lead: 'Le lien d’intégration du Junior s’ouvre.',
    owner: StepOwners.Responsable,
    phases: ['needsKickoff'],
    destination: 'fsiTimeline',
  },
  {
    key: 'integration',
    period: 'preparation',
    icon: 'mail',
    label: 'Formulaire d’intégration',
    lead: 'Le Junior remplit son formulaire.',
    owner: StepOwners.Junior,
    phases: ['awaitingInfo'],
  },
  {
    key: 'launch',
    period: 'preparation',
    icon: 'climb',
    label: 'Lancement de la PIM',
    lead: 'La PIM se lance dès que tous les formulaires sont rendus.',
    owner: null,
    phases: ['ready'],
    destination: 'sessionLaunch',
  },
  {
    key: 'periodOne',
    period: 'periodOne',
    icon: 'academy',
    label: 'Formations et lives',
    lead: 'Memora, les formations et les premiers lives.',
    owner: StepOwners.Junior,
    phases: ['periodOne'],
    destination: 'fsiTrainings',
  },
  {
    key: 'reviewOne',
    period: 'periodOne',
    icon: 'sheet',
    label: 'Bilan de 1ère phase',
    lead: 'Le Formateur dépose le bilan.',
    owner: StepOwners.Formateurs,
    phases: ['reviewOneDue'],
    destination: 'fsiReviews',
  },
  {
    key: 'passOne',
    period: 'periodOne',
    icon: 'confirm',
    label: 'Passage accordé',
    lead: 'Le Responsable accorde ou refuse le passage.',
    owner: StepOwners.Responsable,
    phases: ['reviewOneSubmitted'],
    destination: 'fsiReviews',
  },
  {
    key: 'standby',
    period: 'periodOne',
    icon: 'pending',
    label: 'Période 1 achevée',
    lead: 'La période 2 démarre pour toute la promotion.',
    owner: null,
    phases: ['periodOneDone'],
  },
  {
    key: 'periodTwo',
    period: 'periodTwo',
    icon: 'objective',
    label: 'Objectifs et lives',
    lead: 'Objectifs, spécialisations et nouveaux lives.',
    owner: StepOwners.Both,
    phases: ['periodTwo'],
    destination: 'fsiObjectives',
  },
  {
    key: 'reviewTwo',
    period: 'periodTwo',
    icon: 'sheet',
    label: 'Bilan de 2e phase',
    lead: 'Le Formateur donne son avis.',
    owner: StepOwners.Formateurs,
    phases: ['reviewTwoDue'],
    destination: 'fsiReviews',
  },
  {
    key: 'decisionTwo',
    period: 'periodTwo',
    icon: 'confirm',
    label: 'Décision du Responsable',
    lead: 'Officialisation, refus ou 3e période.',
    owner: StepOwners.Responsable,
    phases: ['reviewTwoSubmitted'],
    destination: 'fsiReviews',
  },
  {
    key: 'periodThree',
    period: 'periodThree',
    icon: 'clock',
    label: 'Dernière ligne droite',
    lead: 'Une dernière période, jusqu’à une date limite.',
    owner: StepOwners.Both,
    phases: ['periodThree'],
    destination: 'fsiObjectives',
    optional: true,
  },
  {
    key: 'finalReview',
    period: 'periodThree',
    icon: 'sheet',
    label: 'Bilan définitif',
    lead: 'Le Formateur fait le bilan définitif.',
    owner: StepOwners.Formateurs,
    phases: ['finalReviewDue'],
    destination: 'fsiReviews',
    optional: true,
  },
  {
    key: 'decisionFinal',
    period: 'periodThree',
    icon: 'confirm',
    label: 'Décision finale',
    lead: 'Officialisation ou fin d’aventure.',
    owner: StepOwners.Responsable,
    phases: ['finalReviewSubmitted'],
    destination: 'fsiReviews',
    optional: true,
  },
  {
    key: 'official',
    period: 'official',
    icon: 'star',
    label: 'Officialisation',
    lead: 'Modérateur, Division 1.',
    owner: null,
    phases: ['graduated', 'dismissed', 'resigned'],
  },
]

/**
 * How the last moment reads when the journey ends badly
 * @type {Partial<Record<ParkourPhase, { label: string, icon: IconName, lead: string }>>}
 */

export const PARKOUR_ENDINGS: Partial<
  Record<ParkourPhase, { label: string; icon: IconName; lead: string }>
> = {
  dismissed: {
    label: 'Destitué',
    icon: 'close',
    lead: 'Fin d’aventure, données effacées.',
  },
  resigned: {
    label: 'Démissionnaire',
    icon: 'close',
    lead: 'Le Junior a démissionné, données effacées.',
  },
}

/**
 * Copy of the timelines
 * @type {Record<string, string>}
 */

export const TIMELINE_COPY = {
  automatic: 'Automatique',
  recruitmentRunning: 'La session de recrutement est en cours.',
  recruitmentOver: 'Les candidats retenus ont reçu leur formulaire.',
  recruitmentLabel: 'Recrutement',
} as const
