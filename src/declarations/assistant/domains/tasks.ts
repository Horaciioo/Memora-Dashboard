import { CREATE_VERBS, DONE_WORDS, TASK_NOUNS } from '@/declarations/assistant/lexicon/shared'
import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Tasks
 * @type {DomainDef}
 */

export const TASKS = defineDomain({
  label: 'Tâches',
  summary:
    'Je crée une tâche pour toi, je la marque faite, je la rouvre ou je la supprime, et j’ouvre celle que tu cherches.',
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
    completeTask: {
      label: 'Marquer une tâche faite',
      kind: 'act',
      verbs: ['marque', 'marquer', 'marques', 'coche', 'cocher'],
      nouns: TASK_NOUNS,
      weakNouns: DONE_WORDS,
      needs: 'both',
      pages: [ROUTES.tasks],
      examples: ['Marque ma tâche faite', 'Coche la tâche du planning'],
    },
    reopenTask: {
      label: 'Rouvrir une tâche',
      kind: 'act',
      verbs: ['reouvre', 'reouvrir', 'rouvrir', 'reactive', 'reactiver'],
      nouns: TASK_NOUNS,
      needs: 'both',
      pages: [ROUTES.tasks],
      examples: ['Réouvre la tâche du tournoi', 'Réactive ma tâche'],
    },
    deleteTask: {
      label: 'Supprimer une tâche',
      kind: 'act',
      verbs: ['supprime', 'supprimer', 'supprimes', 'efface', 'effacer', 'enleve', 'vire'],
      nouns: TASK_NOUNS,
      needs: 'both',
      permission: Permissions.TaskDelete,
      pages: [ROUTES.tasks],
      examples: ['Supprime la tâche du planning', 'Efface cette tâche'],
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
