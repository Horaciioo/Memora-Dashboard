import {
  ASSISTANT_PRIORITIES,
  CREATE_VERBS,
  DONE_WORDS,
  TASK_NOUNS,
} from '@/declarations/assistant/lexicon/shared'
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
      boost: 15,
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
    completeAllTasks: {
      label: 'Marquer toutes mes tâches faites',
      kind: 'act',
      verbs: ['marque', 'marquer', 'marques', 'coche', 'cocher'],
      nouns: TASK_NOUNS,
      phrases: ['toutes mes taches', 'toutes les taches', 'tout mes taches'],
      needs: 'both',
      pages: [ROUTES.tasks],
      examples: ['Marque toutes mes tâches faites', 'Coche toutes les tâches'],
    },
    postponeTask: {
      label: 'Décaler une tâche',
      kind: 'act',
      verbs: ['decale', 'decaler', 'decales', 'reporte', 'reporter', 'repousse', 'repousser'],
      nouns: TASK_NOUNS,
      needs: 'both',
      permission: Permissions.TaskManage,
      pages: [ROUTES.tasks],
      examples: ['Décale la tâche du planning à vendredi', 'Reporte cette tâche à demain'],
    },
    assignTask: {
      label: 'Assigner une tâche',
      kind: 'act',
      verbs: ['confie', 'confier', 'confies', 'reassigne', 'reassigner', 'transfere', 'transferer'],
      nouns: TASK_NOUNS,
      needs: 'both',
      permission: Permissions.TaskManage,
      pages: [ROUTES.tasks],
      examples: ['Confie la tâche du planning à Procy', 'Réassigne cette tâche à Léa'],
    },
    setTaskPriority: {
      label: 'Changer la priorité d’une tâche',
      kind: 'act',
      verbs: ['priorise', 'passe', 'mets', 'met', 'change', 'classe'],
      nouns: TASK_NOUNS,
      companions: Object.keys(ASSISTANT_PRIORITIES),
      needs: 'both',
      permission: Permissions.TaskUpdate,
      pages: [ROUTES.tasks],
      examples: ['Passe la tâche du planning en urgent', 'Mets cette tâche en priorité haute'],
    },
    commentTask: {
      label: 'Commenter une tâche',
      kind: 'act',
      verbs: ['commente', 'commenter', 'commentes'],
      nouns: TASK_NOUNS,
      needs: 'both',
      boost: 15,
      pages: [ROUTES.tasks],
      examples: [
        'Commente la tâche du planning : bien reçu',
        'Commente cette tâche : je m’en occupe',
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
