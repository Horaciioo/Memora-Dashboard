import { createRegistry } from '@/core/lib/registry'
import {
  AcademyStepKinds,
  AcademyJuniorStatuses,
  AcademyPrograms,
  AcademySessionStatuses,
  AcademyTracks,
} from '@/utils/constants/hierarchy'
import type {
  AcademyStepKindName,
  AcademyJuniorStatusName,
  AcademyProgramName,
  AcademySessionStatusName,
  AcademyTrackName,
} from '@/utils/constants/hierarchy'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Training programme metadata
 * @typedef {Object} ProgramOption
 * @property {string} label - Short code shown on a session
 * @property {string} summary - Surface the programme covers
 * @property {string} accent - Colour token
 * @property {IconName} icon - Glyph key
 */

interface ProgramOption {
  label: string
  summary: string
  accent: string
  icon: IconName
}

const PROGRAM_MAP: Record<AcademyProgramName, ProgramOption> = {
  [AcademyPrograms.Twitch]: {
    label: 'PIMT',
    summary: 'Parcours Twitch, jusqu’à 13 lives accompagnés.',
    accent: 'brand',
    icon: 'livecon',
  },
  [AcademyPrograms.Youtube]: {
    label: 'PIMY',
    summary: 'Parcours YouTube, jusqu’à 13 lives accompagnés.',
    accent: 'danger',
    icon: 'youtuber',
  },
  [AcademyPrograms.Discord]: {
    label: 'PIMD',
    summary: 'Parcours Discord, centré sur la modération écrite.',
    accent: 'info',
    icon: 'discord',
  },
  [AcademyPrograms.Polyvalent]: {
    label: 'PIMP',
    summary: 'Parcours polyvalent, toutes les surfaces à la fois.',
    accent: 'success',
    icon: 'spark',
  },
}

export const ACADEMY_PROGRAM_REGISTRY = createRegistry(PROGRAM_MAP)

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

const TRACK_MAP: Record<AcademyTrackName, AcademyOption> = {
  [AcademyTracks.Entry]: {
    label: 'Chemin d’entrée',
    summary: 'Junior débutant, tout est à découvrir.',
    accent: 'info',
  },
  [AcademyTracks.Adaptation]: {
    label: 'Voie d’adaptation',
    summary: 'Junior déjà à l’aise avec l’environnement.',
    accent: 'success',
  },
}

export const ACADEMY_TRACK_REGISTRY = createRegistry(TRACK_MAP)

const SESSION_STATUS_MAP: Record<AcademySessionStatusName, AcademyOption> = {
  [AcademySessionStatuses.Planned]: { label: 'À venir', accent: 'neutral' },
  [AcademySessionStatuses.Running]: { label: 'En cours', accent: 'success' },
  [AcademySessionStatuses.Closed]: { label: 'Clôturée', accent: 'info' },
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
