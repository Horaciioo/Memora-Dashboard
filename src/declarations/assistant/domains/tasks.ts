import { CREATE_VERBS, TASK_NOUNS } from '@/declarations/assistant/lexicon/shared'
import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Tasks
 * @type {DomainDef}
 */

export const TASKS = defineDomain({
  label: 'Tâches',
  summary: 'Je crée une tâche pour toi et j’ouvre celle que tu cherches.',
  intents: {
    createTask: {
      label: 'Créer une tâche',
      kind: 'act',
      verbs: CREATE_VERBS,
      nouns: TASK_NOUNS,
      needs: 'both',
      permission: Permissions.TaskCreate,
      pages: [ROUTES.tasks],
      examples: [
        'Crée une tâche pour Procy : préparer le planning vendredi',
        'Ajoute une tâche demain',
      ],
    },
    openTask: {
      label: 'Ouvrir une tâche',
      kind: 'read',
      nouns: TASK_NOUNS,
      needs: 'noun',
      pages: [ROUTES.tasks],
      examples: ['Ouvre la tâche du planning', 'Montre la tâche du tournoi'],
    },
  },
})
