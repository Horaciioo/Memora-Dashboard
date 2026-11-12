import { createRegistry } from '@/core/lib/registry'
import { UnbanLinkStates, UnbanQuestionTypes, UnbanStatuses } from '@/utils/constants/unban'
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
 * @property {boolean} hasOptions - Answers come from a list
 * @property {boolean} isList - Options drawn as a visible list
 */

interface UnbanQuestionTypeOption {
  label: string
  icon: IconName
  fieldKind: FieldKind
  hasOptions: boolean
  isList: boolean
}

const FREE = { hasOptions: false, isList: false }
const CHOICE = { hasOptions: true, isList: true }

const QUESTION_TYPE_MAP: Record<UnbanQuestionTypeName, UnbanQuestionTypeOption> = {
  [UnbanQuestionTypes.ShortText]: {
    label: 'Texte court',
    icon: 'dash',
    fieldKind: 'text',
    ...FREE,
  },
  [UnbanQuestionTypes.LongText]: {
    label: 'Texte long',
    icon: 'paragraph',
    fieldKind: 'textarea',
    ...FREE,
  },
  [UnbanQuestionTypes.SingleChoice]: {
    label: 'Choix unique',
    icon: 'bulletRing',
    fieldKind: 'select',
    ...CHOICE,
  },
  [UnbanQuestionTypes.MultipleChoice]: {
    label: 'Choix multiple',
    icon: 'checkbox',
    fieldKind: 'multiselect',
    ...CHOICE,
  },
  [UnbanQuestionTypes.Dropdown]: {
    label: 'Liste déroulante',
    icon: 'expand',
    fieldKind: 'select',
    hasOptions: true,
    isList: false,
  },
  [UnbanQuestionTypes.Scale]: { label: 'Échelle', icon: 'metrics', fieldKind: 'scale', ...FREE },
  [UnbanQuestionTypes.Date]: { label: 'Date', icon: 'deadline', fieldKind: 'date', ...FREE },
}

export const UNBAN_QUESTION_TYPE_REGISTRY = createRegistry(QUESTION_TYPE_MAP)
