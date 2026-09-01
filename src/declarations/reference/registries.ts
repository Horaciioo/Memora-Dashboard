import { createRegistry } from '@/core/lib/registry'
import {
  AbsenceStatuses,
  AttendeeKinds,
  EventVisibilities,
  FunctionKinds,
  WorkflowPhases,
  WorkflowScopes,
} from '@/utils/constants/workflow'
import type {
  AbsenceStatusName,
  AttendeeKindName,
  EventVisibilityName,
  FunctionKindName,
  WorkflowPhaseName,
  WorkflowScopeName,
} from '@/utils/constants/workflow'

/**
 * Labelled option
 * @typedef {Object} LabelledOption
 * @property {string} label - Display label
 * @property {string} [accent] - Colour token
 */

interface LabelledOption {
  label: string
  accent?: string
}

const WORKFLOW_SCOPE_MAP: Record<WorkflowScopeName, LabelledOption> = {
  [WorkflowScopes.Project]: { label: 'Projets' },
  [WorkflowScopes.Task]: { label: 'Tâches' },
  [WorkflowScopes.Meeting]: { label: 'Réunions' },
}

export const WORKFLOW_SCOPE_REGISTRY = createRegistry(WORKFLOW_SCOPE_MAP)

// Declared in flow order, the done bucket driving what boards hide
const WORKFLOW_PHASE_MAP: Record<WorkflowPhaseName, LabelledOption> = {
  [WorkflowPhases.Todo]: { label: 'À faire', accent: 'neutral' },
  [WorkflowPhases.Doing]: { label: 'En cours', accent: 'info' },
  [WorkflowPhases.Done]: { label: 'Terminé', accent: 'success' },
}

export const WORKFLOW_PHASE_REGISTRY = createRegistry(WORKFLOW_PHASE_MAP)

const FUNCTION_KIND_MAP: Record<FunctionKindName, LabelledOption> = {
  [FunctionKinds.Primary]: { label: 'Fonction principale', accent: 'brand' },
  [FunctionKinds.Secondary]: { label: 'Fonction secondaire', accent: 'info' },
}

export const FUNCTION_KIND_REGISTRY = createRegistry(FUNCTION_KIND_MAP)

const ATTENDEE_KIND_MAP: Record<AttendeeKindName, LabelledOption> = {
  [AttendeeKinds.Lead]: { label: 'Auditeur principal', accent: 'brand' },
  [AttendeeKinds.Assistant]: { label: 'Assistant', accent: 'info' },
  [AttendeeKinds.Participant]: { label: 'Modérateur participant', accent: 'neutral' },
}

export const ATTENDEE_KIND_REGISTRY = createRegistry(ATTENDEE_KIND_MAP)

const ABSENCE_STATUS_MAP: Record<AbsenceStatusName, LabelledOption> = {
  [AbsenceStatuses.Pending]: { label: 'En attente', accent: 'warning' },
  [AbsenceStatuses.Approved]: { label: 'Validée', accent: 'success' },
  [AbsenceStatuses.Refused]: { label: 'Refusée', accent: 'danger' },
  [AbsenceStatuses.Cancelled]: { label: 'Annulée', accent: 'neutral' },
}

export const ABSENCE_STATUS_REGISTRY = createRegistry(ABSENCE_STATUS_MAP)

const EVENT_VISIBILITY_MAP: Record<EventVisibilityName, LabelledOption> = {
  [EventVisibilities.Everyone]: { label: 'Tout le monde', accent: 'success' },
  [EventVisibilities.Responsables]: { label: 'Responsables et plus', accent: 'warning' },
  [EventVisibilities.Admins]: { label: 'Administrateurs seuls', accent: 'danger' },
}

export const EVENT_VISIBILITY_REGISTRY = createRegistry(EVENT_VISIBILITY_MAP)
