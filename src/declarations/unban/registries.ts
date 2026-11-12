import { createRegistry } from '@/core/lib/registry'
import {
  UnbanLinkStates,
  UnbanQuestionTypes,
  UnbanStatuses,
} from '@/utils/constants/unban'
import type { IconName } from '@/declarations/ui/icons'
import type { Tone } from '@/declarations/ui/theme'
import type { FieldKind } from '@/types/forms'
import type {
  UnbanLinkStateName,
  UnbanQuestionTypeName,
  UnbanStatusName,
} from '@/utils/constants/unban'

/**
 * Labelled state with its glyph and colour
 * @typedef {Object} UnbanStateOption
 * @property {string} label - Display label
 * @property {IconName} icon - Glyph
 * @property {Tone} accent - Colour tone
 */

interface UnbanStateOption {
  label: string
  icon: IconName
  accent: Tone
}

const STATUS_MAP: Record<UnbanStatusName, UnbanStateOption> = {
  [UnbanStatuses.Pending]: { label: 'En attente', icon: 'pending', accent: 'warning' },
  [UnbanStatuses.InReview]: { label: 'En cours de traitement', icon: 'waiting', accent: 'info' },
  [UnbanStatuses.Accepted]: { label: 'Acceptée', icon: 'success', accent: 'success' },
  [UnbanStatuses.Refused]: { label: 'Refusée', icon: 'failure', accent: 'danger' },
}

export const UNBAN_STATUS_REGISTRY = createRegistry(STATUS_MAP)

const LINK_STATE_MAP: Record<UnbanLinkStateName, UnbanStateOption> = {
  [UnbanLinkStates.Active]: { label: 'Actif', icon: 'link', accent: 'success' },
  [UnbanLinkStates.Used]: { label: 'Utilisé', icon: 'check', accent: 'info' },
  [UnbanLinkStates.Expired]: { label: 'Expiré', icon: 'clock', accent: 'neutral' },
  [UnbanLinkStates.Revoked]: { label: 'Révoqué', icon: 'blocked', accent: 'danger' },
}

export const UNBAN_LINK_STATE_REGISTRY = createRegistry(LINK_STATE_MAP)

/**
 * Question type with the field kind that renders it
 * @typedef {Object} UnbanQuestionTypeOption
 * @property {string} label - Display label
 * @property {IconName} icon - Glyph
 * @property {FieldKind} fieldKind - Kind of form field it becomes
 */

interface UnbanQuestionTypeOption {
  label: string
  icon: IconName
  fieldKind: FieldKind
}

const QUESTION_TYPE_MAP: Record<UnbanQuestionTypeName, UnbanQuestionTypeOption> = {
  [UnbanQuestionTypes.ShortText]: { label: 'Texte court', icon: 'dash', fieldKind: 'text' },
  [UnbanQuestionTypes.LongText]: { label: 'Texte long', icon: 'paragraph', fieldKind: 'textarea' },
  [UnbanQuestionTypes.SingleChoice]: {
    label: 'Choix unique',
    icon: 'bulletRing',
    fieldKind: 'select',
  },
  [UnbanQuestionTypes.MultipleChoice]: {
    label: 'Choix multiple',
    icon: 'checkbox',
    fieldKind: 'multiselect',
  },
  [UnbanQuestionTypes.Dropdown]: { label: 'Liste déroulante', icon: 'expand', fieldKind: 'select' },
  [UnbanQuestionTypes.Scale]: { label: 'Échelle', icon: 'metrics', fieldKind: 'scale' },
  [UnbanQuestionTypes.Date]: { label: 'Date', icon: 'deadline', fieldKind: 'date' },
}

export const UNBAN_QUESTION_TYPE_REGISTRY = createRegistry(QUESTION_TYPE_MAP)
