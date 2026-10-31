import type { AccessCategoryName } from '@/utils/constants/hierarchy'
import type { RecruitmentOwnerName } from '@/utils/constants/recruitment'
import type { FunctionKindName } from '@/utils/constants/workflow'

// Read by the seed on plain node

/**
 * Division every member can be ranked in
 * @typedef {Object} FixedDivision
 * @property {string} name - Display name
 * @property {number} rank - Unique rank, also the chevrons on its emblem
 * @property {string} summary - Supporting line
 * @property {boolean} leadAssignable - A responsable may assign it
 */

export interface FixedDivision {
  name: string
  rank: number
  summary: string
  leadAssignable: boolean
}

/**
 * Divisions
 * @type {readonly FixedDivision[]}
 */

export const FIXED_DIVISIONS: readonly FixedDivision[] = [
  { name: 'Division I', rank: 1, summary: 'Première division.', leadAssignable: true },
  { name: 'Division II', rank: 2, summary: 'Deuxième division.', leadAssignable: true },
  { name: 'Division III', rank: 3, summary: 'Troisième division.', leadAssignable: false },
  { name: 'Division IV', rank: 4, summary: 'Division des responsables.', leadAssignable: false },
]

/**
 * Rank of the division every responsable sits in
 * @type {number}
 */

export const LEAD_DIVISION_RANK = Math.max(...FIXED_DIVISIONS.map((division) => division.rank))

/**
 * Function a member holds under their role
 * @typedef {Object} FixedFunction
 * @property {string} name - Display name
 * @property {FunctionKindName} kind - Principal or secondary
 * @property {number} position - Rank
 * @property {string} icon - Glyph key
 * @property {string} accent - Colour
 * @property {AccessCategoryName} category - Access console section
 * @property {string} summary - Supporting line
 */

export interface FixedFunction {
  name: string
  kind: FunctionKindName
  position: number
  icon: string
  accent: string
  category: AccessCategoryName
  summary: string
}

/**
 * Function names
 * @type {Record<string, string>}
 */

export const FunctionNames = {
  Discord: 'Discord',
  Lives: 'Lives',
  Animators: 'Animateurs',
  JuniorDiscord: 'Junior Discord',
  JuniorLives: 'Junior Lives',
  JuniorAnimators: 'Junior Animateurs',
  Recruiters: 'Recruteurs',
  Trainers: 'Formateurs',
  Observers: 'Observateurs',
  Coordinator: 'Coordinateur de Live',
} as const

// Secondary functions that open a team picker
export const RECRUITER_FUNCTION = FunctionNames.Recruiters
export const OBSERVER_FUNCTION = FunctionNames.Observers
export const TRAINER_FUNCTION = FunctionNames.Trainers
// Holders may be asked to coordinate a live
export const COORDINATOR_FUNCTION = FunctionNames.Coordinator

/**
 * Functions
 * @type {readonly FixedFunction[]}
 */

export const FIXED_FUNCTIONS: readonly FixedFunction[] = [
  {
    name: FunctionNames.Discord,
    kind: 'PRIMARY',
    position: 1,
    icon: 'functionDiscord',
    accent: '#6a9bd1',
    category: 'MODERATION',
    summary: 'Modère les serveurs Discord.',
  },
  {
    name: FunctionNames.Lives,
    kind: 'PRIMARY',
    position: 2,
    icon: 'functionLive',
    accent: '#d98ba6',
    category: 'MODERATION',
    summary: 'Modère le chat des lives.',
  },
  {
    name: FunctionNames.Animators,
    kind: 'PRIMARY',
    position: 3,
    icon: 'functionAnimator',
    accent: '#e3c25a',
    category: 'MODERATION',
    summary: 'Anime la communauté.',
  },
  {
    name: FunctionNames.JuniorDiscord,
    kind: 'PRIMARY',
    position: 4,
    icon: 'functionJuniorDiscord',
    accent: '#5b8fe0',
    category: 'JUNIOR',
    summary: 'Se forme à la modération Discord pendant sa PIM.',
  },
  {
    name: FunctionNames.JuniorLives,
    kind: 'PRIMARY',
    position: 5,
    icon: 'functionJuniorLive',
    accent: '#8b5cf6',
    category: 'JUNIOR',
    summary: 'Se forme à la modération des lives pendant sa PIM.',
  },
  {
    name: FunctionNames.JuniorAnimators,
    kind: 'PRIMARY',
    position: 6,
    icon: 'functionJuniorAnimator',
    accent: '#e6b030',
    category: 'JUNIOR',
    summary: 'Se forme à l’animation pendant sa PIM.',
  },
  {
    name: FunctionNames.Recruiters,
    kind: 'SECONDARY',
    position: 7,
    icon: 'functionRecruiter',
    accent: '#6fc0b5',
    category: 'MODERATION',
    summary: 'Mène les recrutements.',
  },
  {
    name: TRAINER_FUNCTION,
    kind: 'SECONDARY',
    position: 8,
    icon: 'functionTrainer',
    accent: '#7dbf8e',
    category: 'MODERATION',
    summary: 'Forme les juniors de l’Academy.',
  },
  {
    name: OBSERVER_FUNCTION,
    kind: 'SECONDARY',
    position: 12,
    icon: 'functionObserver',
    accent: '#8b7fd6',
    category: 'MODERATION',
    summary: 'Assiste aux entretiens de recrutement.',
  },
  {
    name: COORDINATOR_FUNCTION,
    kind: 'SECONDARY',
    position: 13,
    icon: 'coordinator',
    accent: '#d97706',
    category: 'MODERATION',
    summary: 'Peut être choisi pour coordonner un live.',
  },
  {
    name: 'Junior Responsable Discord',
    kind: 'PRIMARY',
    position: 9,
    icon: 'functionJuniorLead',
    accent: '#ff4d00',
    category: 'JUNIOR_RESPONSABLE',
    summary: 'Se prépare à diriger la modération Discord pendant son Legacy.',
  },
  {
    name: 'Junior Responsable Lives',
    kind: 'PRIMARY',
    position: 10,
    icon: 'functionJuniorLead',
    accent: '#ff4d00',
    category: 'JUNIOR_RESPONSABLE',
    summary: 'Se prépare à diriger la modération des lives pendant son Legacy.',
  },
  {
    name: 'Junior Responsable Animateurs',
    kind: 'PRIMARY',
    position: 11,
    icon: 'functionJuniorLead',
    accent: '#ff4d00',
    category: 'JUNIOR_RESPONSABLE',
    summary: 'Se prépare à diriger les animateurs pendant son Legacy.',
  },
]

/**
 * Junior function held during a PIM
 * @type {Readonly<Record<string, string>>}
 */

export const JUNIOR_FUNCTION_OF: Readonly<Record<string, string>> = {
  [FunctionNames.Discord]: FunctionNames.JuniorDiscord,
  [FunctionNames.Lives]: FunctionNames.JuniorLives,
  [FunctionNames.Animators]: FunctionNames.JuniorAnimators,
}

/**
 * Function held during a Legacy track
 * @type {Readonly<Record<string, string>>}
 */

export const LEGACY_FUNCTION_OF: Readonly<Record<string, string>> = {
  [FunctionNames.Discord]: 'Junior Responsable Discord',
  [FunctionNames.Lives]: 'Junior Responsable Lives',
  [FunctionNames.Animators]: 'Junior Responsable Animateurs',
}

/**
 * Trade a function stands for
 * @param {string} name - Function name
 * @return {string} - Trade name
 */

export const tradeOfFunction = (name: string): string =>
  [...Object.entries(JUNIOR_FUNCTION_OF), ...Object.entries(LEGACY_FUNCTION_OF)].find(
    ([, junior]) => junior === name
  )?.[0] ?? name

/**
 * Urgency level shared by projects and tasks
 * @typedef {Object} FixedPriority
 * @property {string} name - Display name
 * @property {number} weight - Unique weight
 * @property {string} accent - Tone
 * @property {boolean} isDefault - Preset of a new record
 */

export interface FixedPriority {
  name: string
  weight: number
  accent: string
  isDefault: boolean
}

/**
 * Priority names
 * @type {Record<string, string>}
 */

export const PriorityNames = {
  Low: 'Basse',
  Normal: 'Normale',
  High: 'Haute',
  Urgent: 'Urgente',
} as const

/**
 * Priorities
 * @type {readonly FixedPriority[]}
 */

export const FIXED_PRIORITIES: readonly FixedPriority[] = [
  { name: PriorityNames.Low, weight: 1, accent: 'neutral', isDefault: false },
  { name: PriorityNames.Normal, weight: 2, accent: 'info', isDefault: true },
  { name: PriorityNames.High, weight: 3, accent: 'warning', isDefault: false },
  { name: PriorityNames.Urgent, weight: 4, accent: 'danger', isDefault: false },
]

/**
 * Livecon level
 * @typedef {Object} FixedLiveconLevel
 * @property {number} level - Unique level
 * @property {string} name - Display name
 * @property {string} icon - Glyph key
 * @property {string} summary - What the level means
 * @property {string} guidelines - How the team works under it
 * @property {string} accent - Tone
 */

export interface FixedLiveconLevel {
  level: number
  name: string
  icon: string
  summary: string
  guidelines: string
  accent: string
}

/**
 * The three livecon levels
 * @type {readonly FixedLiveconLevel[]}
 */

export const FIXED_LIVECON_LEVELS: readonly FixedLiveconLevel[] = [
  {
    level: 3,
    name: 'Livecon 3',
    icon: 'liveconCalm',
    summary: 'Le niveau le plus sûr : les consignes sont allégées et les urgences rares.',
    guidelines:
      'Modère au barème habituel. Les avertissements passent avant les timeouts dès que le panel le permet.',
    accent: 'success',
  },
  {
    level: 2,
    name: 'Livecon 2',
    icon: 'liveconWatch',
    summary:
      'Le niveau intermédiaire : un drama naît, une mauvaise action a surgi. Quelques sanctions se durcissent pour tasser vite et se concentrer sur l’essentiel.',
    guidelines:
      'Le panel ne change que légèrement, par précaution. Ce niveau demande surtout une surveillance accrue du chat.',
    accent: 'caution',
  },
  {
    level: 1,
    name: 'Livecon 1',
    icon: 'liveconCrisis',
    summary:
      'Le niveau le plus strict : un point de non-retour pour beaucoup d’infractions. La sévérité est de mise, avec peu de secondes chances.',
    guidelines:
      'La priorité absolue est le confort du créateur. Dans le doute, la sanction la plus ferme du palier s’applique.',
    accent: 'danger',
  },
]

/**
 * Column of the recruitment results board
 * @typedef {Object} FixedRecruitmentOutcome
 * @property {string} name - Display name
 * @property {string} accent - Tone
 * @property {boolean} isDefault - Column a new candidate lands in
 * @property {boolean} isTerminal - Closes the application
 * @property {boolean} admits - Enrols the candidate into the promotion
 */

export interface FixedRecruitmentOutcome {
  name: string
  accent: string
  isDefault: boolean
  isTerminal: boolean
  admits: boolean
}

/**
 * Stable names of the recruitment outcomes, read wherever one is looked up
 * @type {Record<string, string>}
 */

export const OutcomeNames = {
  ToProcess: 'À traiter',
  Scheduled: 'Entretien posé',
  Deliberating: 'En délibération',
  Favorable: 'Favorable',
  Unfavorable: 'Défavorable',
  Mixed: 'Mitigé',
  Accepted: 'Accepté',
  Refused: 'Refusé',
  Withdrawn: 'Désisté',
} as const

/**
 * Outcomes closing an interview with a verdict
 * @type {readonly string[]}
 */

export const VERDICT_OUTCOMES: readonly string[] = [
  OutcomeNames.Favorable,
  OutcomeNames.Mixed,
  OutcomeNames.Unfavorable,
]

/**
 * Recruitment outcomes
 * @type {readonly FixedRecruitmentOutcome[]}
 */

export const FIXED_RECRUITMENT_OUTCOMES: readonly FixedRecruitmentOutcome[] = [
  {
    name: OutcomeNames.ToProcess,
    accent: 'neutral',
    isDefault: true,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Scheduled,
    accent: 'info',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Deliberating,
    accent: 'caution',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Favorable,
    accent: 'success',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Unfavorable,
    accent: 'danger',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Mixed,
    accent: 'caution',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  {
    name: OutcomeNames.Accepted,
    accent: 'success',
    isDefault: false,
    isTerminal: true,
    admits: true,
  },
  {
    name: OutcomeNames.Refused,
    accent: 'danger',
    isDefault: false,
    isTerminal: true,
    admits: false,
  },
  {
    name: OutcomeNames.Withdrawn,
    accent: 'neutral',
    isDefault: false,
    isTerminal: true,
    admits: false,
  },
]

/**
 * Step of the recruitment trame
 * @typedef {Object} FixedRecruitmentStep
 * @property {string} title - Display name
 * @property {string} description - What happens
 * @property {number} offset - Days after the opening
 * @property {RecruitmentOwnerName} owner - Who carries it
 * @property {boolean} required - Cannot be skipped
 */

export interface FixedRecruitmentStep {
  title: string
  description: string
  offset: number
  owner: RecruitmentOwnerName
  required: boolean
}

/**
 * Recruitment trame
 * @type {readonly FixedRecruitmentStep[]}
 */

export const FIXED_RECRUITMENT_STEPS: readonly FixedRecruitmentStep[] = [
  {
    title: 'Annonce du recrutement',
    description: 'L’appel à candidatures part sur les canaux du YouTubeur.',
    offset: 0,
    owner: 'RESPONSABLE',
    required: true,
  },
  {
    title: 'Clôture des candidatures',
    description: 'Plus aucune candidature n’est acceptée.',
    offset: 7,
    owner: 'RESPONSABLE',
    required: true,
  },
  {
    title: 'Entretiens individuels',
    description: 'Chaque candidat retenu passe un entretien avec les recruteurs.',
    offset: 10,
    owner: 'RECRUTEURS',
    required: true,
  },
  {
    title: 'Délibération',
    description: 'Les recruteurs et le responsable tranchent candidat par candidat.',
    offset: 14,
    owner: 'BOTH',
    required: true,
  },
  {
    title: 'Réunion d’information collective',
    description: 'Les candidats validés découvrent l’équipe et son fonctionnement.',
    offset: 17,
    owner: 'RESPONSABLE',
    required: false,
  },
  {
    title: 'Clear des salons sur le Discord - Staff',
    description: 'Les salons de la session sont vidés et archivés côté staff.',
    offset: 17,
    owner: 'RESPONSABLE',
    required: false,
  },
]
