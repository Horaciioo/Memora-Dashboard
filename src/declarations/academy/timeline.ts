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
    lead: 'Un Responsable attribue un Formateur au Junior.',
    owner: StepOwners.Responsable,
    phases: ['needsTrainer'],
    destination: 'fsiTrainer',
  },
  {
    key: 'kickoff',
    period: 'preparation',
    icon: 'link',
    label: 'Début de PIM déclaré',
    lead: 'Un Responsable déclare le début de la PIM pour cette personne, son lien d’intégration s’ouvre.',
    owner: StepOwners.Responsable,
    phases: ['needsKickoff'],
    destination: 'fsiTimeline',
  },
  {
    key: 'integration',
    period: 'preparation',
    icon: 'mail',
    label: 'Formulaire d’intégration',
    lead: 'Le Junior se connecte avec Discord puis remplit son formulaire : naissance, réseaux, anniversaire fêté ou non.',
    owner: StepOwners.Junior,
    phases: ['awaitingInfo'],
  },
  {
    key: 'launch',
    period: 'preparation',
    icon: 'climb',
    label: 'Lancement de la PIM',
    lead: 'Dès que tous les formulaires sont rendus, la PIM se lance seule. Un Responsable peut la lancer à la main.',
    owner: null,
    phases: ['ready'],
    destination: 'sessionLaunch',
  },
  {
    key: 'periodOne',
    period: 'periodOne',
    icon: 'academy',
    label: 'Formations et lives',
    lead: 'Le Junior découvre Memora et ses formations, jusqu’à ses premiers lives en tant que présent.',
    owner: StepOwners.Junior,
    phases: ['periodOne'],
    destination: 'fsiTrainings',
  },
  {
    key: 'reviewOne',
    period: 'periodOne',
    icon: 'sheet',
    label: 'Bilan de 1ère phase',
    lead: 'Le Formateur remplit le bilan et les compétences, puis le dépose.',
    owner: StepOwners.Formateurs,
    phases: ['reviewOneDue'],
    destination: 'fsiReviews',
  },
  {
    key: 'passOne',
    period: 'periodOne',
    icon: 'confirm',
    label: 'Passage accordé',
    lead: 'La timeline est en pause : le Responsable accorde ou refuse le passage.',
    owner: StepOwners.Responsable,
    phases: ['reviewOneSubmitted'],
    destination: 'fsiReviews',
  },
  {
    key: 'standby',
    period: 'periodOne',
    icon: 'pending',
    label: 'Période 1 achevée',
    lead: 'Rien n’est bloqué : la période 2 démarre pour toute la promotion en même temps.',
    owner: null,
    phases: ['periodOneDone'],
  },
  {
    key: 'periodTwo',
    period: 'periodTwo',
    icon: 'objective',
    label: 'Objectifs et lives',
    lead: 'Objectifs posés, spécialisations débloquées, puis de nouveaux lives en tant que présent.',
    owner: StepOwners.Both,
    phases: ['periodTwo'],
    destination: 'fsiObjectives',
  },
  {
    key: 'reviewTwo',
    period: 'periodTwo',
    icon: 'sheet',
    label: 'Bilan de 2e phase',
    lead: 'Le Formateur fait le bilan et donne son avis : pour, contre, ou une 3e période.',
    owner: StepOwners.Formateurs,
    phases: ['reviewTwoDue'],
    destination: 'fsiReviews',
  },
  {
    key: 'decisionTwo',
    period: 'periodTwo',
    icon: 'confirm',
    label: 'Décision du Responsable',
    lead: 'Le Responsable suit ou non l’avis du Formateur : officialisation, refus ou 3e période.',
    owner: StepOwners.Responsable,
    phases: ['reviewTwoSubmitted'],
    destination: 'fsiReviews',
  },
  {
    key: 'periodThree',
    period: 'periodThree',
    icon: 'clock',
    label: 'Dernière ligne droite',
    lead: 'Seulement si elle est accordée : une dernière période, jusqu’à une date limite fixée par le Responsable.',
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
    lead: 'Le jour de la date limite, le Formateur fait le bilan définitif : pour ou contre.',
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
    lead: 'Le Responsable tranche : officialisation ou fin d’aventure.',
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
    lead: 'Rôle Modérateur, Division 1. La PIM reste dans son parcours pour toujours.',
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
    lead: 'Fin d’aventure. Les données personnelles sont effacées et l’accès coupé.',
  },
  resigned: {
    label: 'Démissionnaire',
    icon: 'close',
    lead: 'Le Junior a démissionné. Les données personnelles sont effacées.',
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
