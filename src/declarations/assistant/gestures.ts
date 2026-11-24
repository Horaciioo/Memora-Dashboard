import { API_ROUTES } from '@/core/lib/api/routes'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AssistantCall, AssistantEntityKind, AssistantRisk } from '@/types/assistant'

/**
 * One thing Memora does in the member's place, through a route that already exists
 * @typedef {Object} GestureDef
 * @property {AssistantRisk} risk - Confirmation level
 * @property {AssistantEntityKind | null} target - What it acts on, none for a global gesture
 * @property {PermissionName} [permission] - Right the route asks, none for a personal gesture
 * @property {string} ask - Question, {name} is the target
 * @property {string} done - Sentence once done, {name} is the target
 * @property {string} [sure] - Second question of a strong gesture
 * @property {string} confirmLabel - Button that runs it
 * @property {(id: string, values: Record<string, unknown>) => AssistantCall} call - Request built from the target
 * @property {string} [undo] - Gesture that takes it back, a registry key
 * @property {AssistantEntityKind} [remember] - Kind the answer of the route names
 */

export interface GestureDef {
  risk: AssistantRisk
  target: AssistantEntityKind | null
  permission?: PermissionName
  ask: string
  done: string
  sure?: string
  confirmLabel: string
  call: (id: string, values: Record<string, unknown>) => AssistantCall
  undo?: string
  remember?: AssistantEntityKind
}

/**
 * Gestures, the chat never goes beyond this list
 * @type {Record<string, GestureDef>}
 */

export const GESTURES = {
  createTask: {
    risk: 'light',
    target: null,
    permission: Permissions.TaskCreate,
    ask: 'Je crée cette tâche ?',
    done: 'C’est fait, la tâche « {name} » est créée.',
    confirmLabel: 'Créer',
    call: (_id, values) => ({ method: 'POST', path: API_ROUTES.tasks, body: values }),
    remember: 'task',
  },
  completeTask: {
    risk: 'light',
    target: 'task',
    permission: Permissions.TaskRead,
    ask: 'Je marque « {name} » comme faite ?',
    done: 'C’est fait, « {name} » est faite.',
    confirmLabel: 'Marquer faite',
    call: (id) => ({ method: 'PATCH', path: API_ROUTES.taskDone(id), body: { done: true } }),
    undo: 'reopenTask',
  },
  reopenTask: {
    risk: 'light',
    target: 'task',
    permission: Permissions.TaskRead,
    ask: 'Je rouvre « {name} » ?',
    done: 'C’est fait, « {name} » est rouverte.',
    confirmLabel: 'Rouvrir',
    call: (id) => ({ method: 'PATCH', path: API_ROUTES.taskDone(id), body: { done: false } }),
    undo: 'completeTask',
  },
  deleteTask: {
    risk: 'strong',
    target: 'task',
    permission: Permissions.TaskDelete,
    ask: 'Je supprime la tâche « {name} » ?',
    sure: 'Dernière vérification : « {name} » disparaît pour tout le monde, je la supprime vraiment ?',
    done: 'C’est fait, « {name} » est supprimée.',
    confirmLabel: 'Supprimer',
    call: (id) => ({ method: 'DELETE', path: API_ROUTES.task(id) }),
  },
  approveAbsence: {
    risk: 'medium',
    target: 'absence',
    permission: Permissions.AbsenceReview,
    ask: 'Je valide l’absence de « {name} » ?',
    done: 'C’est fait, l’absence de « {name} » est validée.',
    confirmLabel: 'Valider',
    call: (id) => ({
      method: 'PATCH',
      path: API_ROUTES.absence(id),
      body: { status: AbsenceStatuses.Approved },
    }),
  },
  refuseAbsence: {
    risk: 'medium',
    target: 'absence',
    permission: Permissions.AbsenceReview,
    ask: 'Je refuse l’absence de « {name} » ?',
    done: 'C’est fait, l’absence de « {name} » est refusée.',
    confirmLabel: 'Refuser',
    call: (id) => ({
      method: 'PATCH',
      path: API_ROUTES.absence(id),
      body: { status: AbsenceStatuses.Refused },
    }),
  },
  takeUnban: {
    risk: 'medium',
    target: 'unban',
    permission: Permissions.UnbanHandle,
    ask: 'Je prends la demande de « {name} » ?',
    done: 'C’est pris, la demande de « {name} » est à toi.',
    confirmLabel: 'Prendre',
    call: (id, values) => ({
      method: 'POST',
      path: API_ROUTES.unbanRequestAction(id, 'take'),
      body: { version: values.version },
    }),
  },
  releaseUnban: {
    risk: 'medium',
    target: 'unban',
    permission: Permissions.UnbanHandle,
    ask: 'Je libère la demande de « {name} » ?',
    done: 'C’est fait, la demande de « {name} » est libérée.',
    confirmLabel: 'Libérer',
    call: (id, values) => ({
      method: 'POST',
      path: API_ROUTES.unbanRequestAction(id, 'release'),
      body: { version: values.version },
    }),
  },
  readNotifications: {
    risk: 'light',
    target: null,
    ask: 'Je marque toutes tes notifications comme lues ?',
    done: 'C’est fait, tes notifications sont lues.',
    confirmLabel: 'Tout marquer lu',
    call: () => ({ method: 'PATCH', path: API_ROUTES.notifications() }),
  },
} as const satisfies Record<string, GestureDef>

export type GestureId = keyof typeof GESTURES
