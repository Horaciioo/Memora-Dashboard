import { createRegistry } from '@/core/lib/registry'
import {
  AcademyStepKinds,
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  StepAnchors,
  StepOwners,
  NoteKinds,
  ObjectiveStatuses,
  ReviewAdvices,
  ReviewStatuses,
  TrainingStatuses,
  TrainingBlockKinds,
  LegacyStatuses,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  AcademyStageName,
  StepAnchorName,
  StepOwnerName,
  NoteKindName,
  ObjectiveStatusName,
  ReviewAdviceName,
  ReviewStatusName,
  TrainingStatusName,
  TrainingBlockKindName,
  LegacyStatusName,
} from '@/utils/constants/hierarchy'
import type { CourseSurface, ExerciseBlock } from '@/declarations/academy/curriculum/types'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Labelled option carrying a colour token
 * @typedef {Object} AcademyOption
 * @property {string} label - Display label
 * @property {string} [summary] - Supporting line
 * @property {string} accent - Colour token
 */

interface AcademyOption {
  label: string
  summary?: string
  accent: string
}

const SESSION_STATUS_MAP: Record<AcademySessionStatusName, AcademyOption> = {
  [AcademySessionStatuses.Draft]: { label: 'Planifiée', accent: 'neutral' },
  [AcademySessionStatuses.Open]: { label: 'Admissions ouvertes', accent: 'warning' },
  [AcademySessionStatuses.Running]: { label: 'En cours', accent: 'success' },
  [AcademySessionStatuses.Closed]: { label: 'Clôturée', accent: 'info' },
  [AcademySessionStatuses.Archived]: { label: 'Archivée', accent: 'neutral' },
}

export const ACADEMY_SESSION_STATUS_REGISTRY = createRegistry(SESSION_STATUS_MAP)

const JUNIOR_STATUS_MAP: Record<AcademyJuniorStatusName, AcademyOption> = {
  [AcademyJuniorStatuses.Active]: { label: 'En formation', accent: 'warning' },
  [AcademyJuniorStatuses.Validated]: { label: 'Validé', accent: 'success' },
  [AcademyJuniorStatuses.Stopped]: { label: 'Arrêté', accent: 'neutral' },
}

export const ACADEMY_JUNIOR_STATUS_REGISTRY = createRegistry(JUNIOR_STATUS_MAP)

/**
 * Session thread moment metadata
 * @typedef {Object} StepKindOption
 * @property {string} label - Display label
 * @property {string} accent - Colour token
 * @property {IconName} icon - Glyph key
 */

interface StepKindOption {
  label: string
  accent: string
  icon: IconName
}

const STEP_KIND_MAP: Record<AcademyStepKindName, StepKindOption> = {
  [AcademyStepKinds.Training]: { label: 'Formation', accent: 'brand', icon: 'academy' },
  [AcademyStepKinds.VoiceReview]: { label: 'Bilan vocal', accent: 'info', icon: 'note' },
  [AcademyStepKinds.Interview]: { label: 'Entrevue', accent: 'success', icon: 'members' },
  [AcademyStepKinds.LeadCheckIn]: {
    label: 'Point responsable',
    accent: 'warning',
    icon: 'shield',
  },
  [AcademyStepKinds.WorkSession]: {
    label: 'Session de travail',
    accent: 'neutral',
    icon: 'tasks',
  },
}

export const ACADEMY_STEP_KIND_REGISTRY = createRegistry(STEP_KIND_MAP)

const STAGE_MAP: Record<AcademyStageName, AcademyOption> = {
  [AcademyStages.Preparation]: { label: 'Préparation', accent: 'neutral' },
  [AcademyStages.Discovery]: { label: 'Découverte', accent: 'info' },
  [AcademyStages.ReviewOne]: { label: 'Bilan 1', accent: 'warning' },
  [AcademyStages.Practice]: { label: 'Pratique', accent: 'brand' },
  [AcademyStages.ReviewFinal]: { label: 'Bilan final', accent: 'warning' },
  [AcademyStages.Bonus]: { label: 'Bonus', accent: 'success' },
}

export const ACADEMY_STAGE_REGISTRY = createRegistry(STAGE_MAP)

const STEP_ANCHOR_MAP: Record<StepAnchorName, AcademyOption> = {
  [StepAnchors.Day]: { label: 'Jour', accent: 'info' },
  [StepAnchors.Live]: { label: 'Live', accent: 'brand' },
}

export const STEP_ANCHOR_REGISTRY = createRegistry(STEP_ANCHOR_MAP)

const STEP_OWNER_MAP: Record<StepOwnerName, AcademyOption> = {
  [StepOwners.Responsable]: { label: 'Responsable', accent: 'warning' },
  [StepOwners.Formateurs]: { label: 'Formateurs', accent: 'brand' },
  [StepOwners.Both]: { label: 'Responsable + Formateurs', accent: 'info' },
  [StepOwners.Junior]: { label: 'Junior', accent: 'success' },
}

export const STEP_OWNER_REGISTRY = createRegistry(STEP_OWNER_MAP)

const NOTE_KIND_MAP: Record<NoteKindName, AcademyOption> = {
  [NoteKinds.Positive]: { label: 'Positive', accent: 'success' },
  [NoteKinds.Negative]: { label: 'Négative', accent: 'danger' },
}

export const NOTE_KIND_REGISTRY = createRegistry(NOTE_KIND_MAP)

const OBJECTIVE_STATUS_MAP: Record<ObjectiveStatusName, AcademyOption> = {
  [ObjectiveStatuses.Open]: { label: 'En cours', accent: 'warning' },
  [ObjectiveStatuses.Reached]: { label: 'Atteint', accent: 'success' },
  [ObjectiveStatuses.Missed]: { label: 'Manqué', accent: 'danger' },
}

export const OBJECTIVE_STATUS_REGISTRY = createRegistry(OBJECTIVE_STATUS_MAP)

const REVIEW_ADVICE_MAP: Record<ReviewAdviceName, AcademyOption> = {
  [ReviewAdvices.Pass]: { label: 'Passe à la suite', accent: 'success' },
  [ReviewAdvices.Bonus]: { label: 'Période bonus', accent: 'info' },
  [ReviewAdvices.Stop]: { label: 'Arrêt du suivi', accent: 'danger' },
}

export const REVIEW_ADVICE_REGISTRY = createRegistry(REVIEW_ADVICE_MAP)

const REVIEW_STATUS_MAP: Record<ReviewStatusName, AcademyOption> = {
  [ReviewStatuses.Draft]: { label: 'Brouillon', accent: 'neutral' },
  [ReviewStatuses.Submitted]: { label: 'Soumis', accent: 'warning' },
  [ReviewStatuses.Validated]: { label: 'Validé', accent: 'success' },
  [ReviewStatuses.Rejected]: { label: 'Refusé', accent: 'danger' },
}

export const REVIEW_STATUS_REGISTRY = createRegistry(REVIEW_STATUS_MAP)

const TRAINING_STATUS_MAP: Record<TrainingStatusName, AcademyOption> = {
  [TrainingStatuses.NotStarted]: { label: 'Non commencée', accent: 'neutral' },
  [TrainingStatuses.InProgress]: { label: 'En cours', accent: 'warning' },
  [TrainingStatuses.Done]: { label: 'Terminée', accent: 'success' },
  [TrainingStatuses.Abandoned]: { label: 'Abandonnée', accent: 'danger' },
}

export const TRAINING_STATUS_REGISTRY = createRegistry(TRAINING_STATUS_MAP)

const BLOCK_KIND_MAP: Record<TrainingBlockKindName, StepKindOption> = {
  [TrainingBlockKinds.Text]: { label: 'Texte', accent: 'neutral', icon: 'note' },
  [TrainingBlockKinds.Quiz]: { label: 'Quiz', accent: 'brand', icon: 'confirm' },
}

export const TRAINING_BLOCK_KIND_REGISTRY = createRegistry(BLOCK_KIND_MAP)

/**
 * Surface metadata of a course
 * @typedef {Object} CourseSurfaceOption
 * @property {string} label - Display name
 * @property {IconName} icon - Glyph
 * @property {string} accent - CSS colour drawing its cover
 */

interface CourseSurfaceOption {
  label: string
  icon: IconName
  accent: string
}

const COURSE_SURFACE_MAP: Record<CourseSurface, CourseSurfaceOption> = {
  general: { label: 'Général', icon: 'academy', accent: 'var(--color-brand-600)' },
  twitch: { label: 'Twitch', icon: 'functionLive', accent: 'var(--twitch-purple)' },
  youtube: { label: 'YouTube', icon: 'youtuber', accent: 'var(--youtube-red)' },
  lives: { label: 'Lives', icon: 'functionLive', accent: 'var(--color-brand-600)' },
  discord: { label: 'Discord', icon: 'functionDiscord', accent: 'var(--discord-blurple)' },
}

export const COURSE_SURFACE_REGISTRY = createRegistry(COURSE_SURFACE_MAP)

/**
 * Metadata of one exercise kind
 * @typedef {Object} CourseKindOption
 * @property {string} label - Display name
 * @property {IconName} icon - Glyph
 */

interface CourseKindOption {
  label: string
  icon: IconName
}

const COURSE_KIND_MAP: Record<ExerciseBlock['kind'], CourseKindOption> = {
  quiz: { label: 'QCM', icon: 'help' },
  fill: { label: 'Texte à trous', icon: 'paragraph' },
  sort: { label: 'Classement', icon: 'filter' },
  order: { label: 'Remise en ordre', icon: 'sort' },
  simulation: { label: 'Simulation', icon: 'flash' },
  case: { label: 'Étude de cas', icon: 'note' },
  command: { label: 'Commande', icon: 'key' },
}

export const COURSE_KIND_REGISTRY = createRegistry(COURSE_KIND_MAP)

/**
 * Where a Legacy track stands
 * @type {Record<LegacyStatusName, AcademyOption>}
 */

const LEGACY_STATUS_MAP: Record<LegacyStatusName, AcademyOption> = {
  [LegacyStatuses.Running]: { label: 'En cours', accent: 'info' },
  [LegacyStatuses.Passed]: { label: 'Réussi', accent: 'success' },
  [LegacyStatuses.Failed]: { label: 'Sans succès', accent: 'danger' },
  [LegacyStatuses.Cancelled]: { label: 'Annulé', accent: 'neutral' },
}

export const LEGACY_STATUS_REGISTRY = createRegistry(LEGACY_STATUS_MAP)
