import type { AccessCategoryName } from '@/utils/constants/hierarchy'
import type { RecruitmentOwnerName } from '@/utils/constants/recruitment'
import type { FunctionKindName } from '@/utils/constants/workflow'

// Read by the seed on plain node, so type imports only

/**
 * Division every member can be ranked in, lowest first
 * @typedef {Object} FixedDivision
 * @property {string} name - Display name
 * @property {number} rank - Unique rank
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
 * Divisions, changed in code only
 * @type {readonly FixedDivision[]}
 */

export const FIXED_DIVISIONS: readonly FixedDivision[] = [
  { name: 'Junior', rank: 0, summary: 'Modérateurs en intégration.', leadAssignable: true },
  { name: 'Squad I', rank: 1, summary: 'Première squad.', leadAssignable: true },
  { name: 'Squad II', rank: 2, summary: 'Deuxième squad.', leadAssignable: true },
  { name: 'Squad III', rank: 3, summary: 'Troisième squad.', leadAssignable: false },
]

/**
 * Function a member holds under their role, principal ones opening a trade, secondary ones adding pages
 * @typedef {Object} FixedFunction
 * @property {string} name - Display name
 * @property {FunctionKindName} kind - Principal or secondary
 * @property {number} position - Rank, principal ones first
 * @property {string} icon - Glyph key, also picking the tint of the role glyph
 * @property {string} accent - Colour, the glyph's own
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
 * Functions, changed in code only
 * @type {readonly FixedFunction[]}
 */

export const FIXED_FUNCTIONS: readonly FixedFunction[] = [
  {
    name: 'Discord',
    kind: 'PRIMARY',
    position: 1,
    icon: 'functionDiscord',
    accent: '#5865f2',
    category: 'MODERATION',
    summary: 'Modère les serveurs Discord.',
  },
  {
    name: 'Lives',
    kind: 'PRIMARY',
    position: 2,
    icon: 'functionLive',
    accent: '#7c3aed',
    category: 'MODERATION',
    summary: 'Modère le chat des lives.',
  },
  {
    name: 'Animateurs',
    kind: 'PRIMARY',
    position: 3,
    icon: 'functionAnimator',
    accent: '#c98a1e',
    category: 'MODERATION',
    summary: 'Anime la communauté.',
  },
  {
    name: 'Junior Discord',
    kind: 'PRIMARY',
    position: 4,
    icon: 'functionDiscord',
    accent: '#8f98f6',
    category: 'MODERATION',
    summary: 'Se forme à la modération Discord pendant sa PIM.',
  },
  {
    name: 'Junior Lives',
    kind: 'PRIMARY',
    position: 5,
    icon: 'functionLive',
    accent: '#a78bfa',
    category: 'MODERATION',
    summary: 'Se forme à la modération des lives pendant sa PIM.',
  },
  {
    name: 'Junior Animateurs',
    kind: 'PRIMARY',
    position: 6,
    icon: 'functionAnimator',
    accent: '#ddb05c',
    category: 'MODERATION',
    summary: 'Se forme à l’animation pendant sa PIM.',
  },
  {
    name: 'Recruteurs',
    kind: 'SECONDARY',
    position: 7,
    icon: 'functionRecruiter',
    accent: '#0d9488',
    category: 'MODERATION',
    summary: 'Mène les recrutements.',
  },
  {
    name: 'Formateurs',
    kind: 'SECONDARY',
    position: 8,
    icon: 'functionTrainer',
    accent: '#16a34a',
    category: 'MODERATION',
    summary: 'Forme les juniors de l’Academy.',
  },
]

/**
 * Junior function held during a PIM, keyed by the function it graduates to
 * @type {Readonly<Record<string, string>>}
 */

export const JUNIOR_FUNCTION_OF: Readonly<Record<string, string>> = {
  Discord: 'Junior Discord',
  Lives: 'Junior Lives',
  Animateurs: 'Junior Animateurs',
}

/**
 * Trade a function stands for, a junior one reading as the trade it trains for
 * @param {string} name - Function name
 * @return {string} - Trade name
 */

export const tradeOfFunction = (name: string): string =>
  Object.entries(JUNIOR_FUNCTION_OF).find(([, junior]) => junior === name)?.[0] ?? name

/**
 * Urgency level shared by projects and tasks
 * @typedef {Object} FixedPriority
 * @property {string} name - Display name
 * @property {number} weight - Unique weight, heavier is more urgent
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
 * Priorities, changed in code only
 * @type {readonly FixedPriority[]}
 */

export const FIXED_PRIORITIES: readonly FixedPriority[] = [
  { name: 'Basse', weight: 1, accent: 'neutral', isDefault: false },
  { name: 'Normale', weight: 2, accent: 'info', isDefault: true },
  { name: 'Haute', weight: 3, accent: 'warning', isDefault: false },
  { name: 'Urgente', weight: 4, accent: 'danger', isDefault: false },
]

/**
 * Livecon level, lower is tenser
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
 * The three livecon levels, changed in code only
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
 * Recruitment outcomes, changed in code only
 * @type {readonly FixedRecruitmentOutcome[]}
 */

export const FIXED_RECRUITMENT_OUTCOMES: readonly FixedRecruitmentOutcome[] = [
  { name: 'À traiter', accent: 'neutral', isDefault: true, isTerminal: false, admits: false },
  { name: 'Entretien posé', accent: 'info', isDefault: false, isTerminal: false, admits: false },
  {
    name: 'En délibération',
    accent: 'caution',
    isDefault: false,
    isTerminal: false,
    admits: false,
  },
  { name: 'Accepté', accent: 'success', isDefault: false, isTerminal: true, admits: true },
  { name: 'Refusé', accent: 'danger', isDefault: false, isTerminal: true, admits: false },
  { name: 'Désisté', accent: 'neutral', isDefault: false, isTerminal: true, admits: false },
]

/**
 * Step of the recruitment trame, days counted from the opening
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
 * Recruitment trame, changed in code only
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
]
