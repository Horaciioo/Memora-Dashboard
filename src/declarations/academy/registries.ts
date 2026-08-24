import { createRegistry } from '@/core/lib/registry'
import {
  AcademyStepKinds,
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  StepAnchors,
  StepOwners,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademySessionStatusName,
  AcademyStageName,
  StepAnchorName,
  StepOwnerName,
} from '@/utils/constants/hierarchy'
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
  [AcademySessionStatuses.Draft]: { label: 'Préparée', accent: 'neutral' },
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
