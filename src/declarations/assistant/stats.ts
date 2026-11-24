import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * One figure Memora can tell, the sentence is hers, the number is read by the service
 * @typedef {Object} StatMeasureDef
 * @property {string} label - Name offered when the sentence names none
 * @property {string[]} phrases - Folded runs of words that name it
 * @property {PermissionName} [permission] - Right of the page that shows it
 * @property {boolean} hasPeriod - Asked over a window, else counted as of today
 * @property {'count' | 'duration'} unit - How the value is told
 * @property {{ zero: string, one: string, many: string }} says - Sentences, {value} and {period}
 * @property {string} href - Page that shows it
 */

export interface StatMeasureDef {
  label: string
  phrases: readonly string[]
  permission?: PermissionName
  hasPeriod: boolean
  unit: 'count' | 'duration'
  says: { zero: string; one: string; many: string }
  href: string
}

/**
 * Figures, a new one is a new entry and its reader in the service
 * @type {Record<string, StatMeasureDef>}
 */

export const STAT_MEASURES = {
  livesModerated: {
    label: 'Les lives que tu as modérés',
    phrases: ['lives', 'live', 'lives moderes', 'modere'],
    permission: Permissions.LiveRead,
    hasPeriod: true,
    unit: 'count',
    says: {
      zero: 'Tu n’as modéré aucun live {period}.',
      one: 'Tu as modéré « {value} » live {period}.',
      many: 'Tu as modéré « {value} » lives {period}.',
    },
    href: ROUTES.lives,
  },
  moderationHours: {
    label: 'Tes heures de modération',
    phrases: ['heures', 'heure', 'temps de moderation', 'temps passe'],
    permission: Permissions.LiveRead,
    hasPeriod: true,
    unit: 'duration',
    says: {
      zero: 'Tu n’as pas de temps de modération {period}.',
      one: 'Tu as modéré pendant « {value} » {period}.',
      many: 'Tu as modéré pendant « {value} » {period}.',
    },
    href: ROUTES.lives,
  },
  tasksOverdue: {
    label: 'Tes tâches en retard',
    phrases: ['taches en retard', 'tache en retard', 'en retard'],
    permission: Permissions.TaskRead,
    hasPeriod: false,
    unit: 'count',
    says: {
      zero: 'Aucune de tes tâches n’est en retard.',
      one: 'Il y a « {value} » tâche en retard.',
      many: 'Il y a « {value} » tâches en retard.',
    },
    href: ROUTES.tasks,
  },
  tasksOpen: {
    label: 'Tes tâches ouvertes',
    phrases: ['taches', 'tache', 'taches ouvertes', 'a faire'],
    permission: Permissions.TaskRead,
    hasPeriod: false,
    unit: 'count',
    says: {
      zero: 'Tu n’as aucune tâche ouverte.',
      one: 'Il te reste « {value} » tâche ouverte.',
      many: 'Il te reste « {value} » tâches ouvertes.',
    },
    href: ROUTES.tasks,
  },
} as const satisfies Record<string, StatMeasureDef>

export type StatMeasureId = keyof typeof STAT_MEASURES

/**
 * Fixed words around a figure
 * @type {Record<string, string>}
 */

export const STATS_COPY = {
  which: 'Quel chiffre veux-tu ?',
  twice: 'deux fois',
  little: 'un peu',
  more: 'C’est {gap} plus que sur la période d’avant.',
  less: 'C’est {gap} moins que sur la période d’avant.',
  hours: 'h',
  minutes: 'min',
  open: 'Tu veux le détail ?',
  tooLong: 'Je ne regarde pas plus loin que {days} jours.',
} as const
