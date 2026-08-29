import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Copy of the project surfaces
 * @type {Record<string, string>}
 */

export const PROJECT_COPY = {
  title: 'Projets',
  lead: 'Chaque projet porte son YouTubeur, son état, sa priorité, sa deadline et son équipe.',
  add: 'Créer un projet',
  emptyTitle: 'Aucun projet pour le moment.',
  filterTitle: 'Aucun projet ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer ce projet ?',
  deleteDescription: 'Ses communications partent avec lui. Ses tâches et réunions sont détachées.',
  missingStates: 'Crée d’abord des états de projet dans la configuration.',
  tabOverview: 'Aperçu',
  tabCommunication: 'Communication',
  tabTasks: 'Tâches',
  tabMeetings: 'Réunions',
  communicationTitle: 'Communication',
  communicationLead: 'Rédige l’annonce ici, l’aperçu montre le rendu Discord en direct.',
  communicationAdd: 'Rédiger une annonce',
  communicationEmptyTitle: 'Aucune annonce pour le moment.',
  communicationDeleteTitle: 'Supprimer cette annonce ?',
  communicationDeleteDescription: 'Le texte est perdu définitivement.',
  published: 'Publiée',
  draft: 'Brouillon',
  informations: 'Informations',
  teamTitle: 'Équipes',
  responsables: 'Responsables',
  assistants: 'Assistants',
  teamAdd: '+ Rajouter quelqu’un',
  teamRemove: 'Retirer',
  teamEmpty: 'Personne pour le moment.',
  tabLogs: 'Journal',
  logsEmptyTitle: 'Aucun évènement pour le moment.',
  logsEmptyDescription: 'Les créations et modifications du projet apparaîtront ici.',
  taskCreate: 'Créer une tâche',
  meetingCreate: 'Planifier une réunion',
} as const

/**
 * Labels of the project form
 * @type {Record<string, string>}
 */

export const PROJECT_FIELD_COPY = {
  title: 'Titre',
  emoji: 'Émoji',
  description: 'Description',
  youtuber: 'YouTubeur concerné',
  state: 'État',
  priority: 'Priorité',
  platform: 'Plateforme',
  deadline: 'Deadline',
  leads: 'Responsables du projet',
  leadsEmpty: 'Aucun',
  assistants: 'Assistants du projet',
  assistantsEmpty: 'Aucun',
  communicationTitle: 'Titre de l’annonce',
  communicationBody: 'Annonce',
  communicationPlatform: 'Plateforme',
  publishedAt: 'Date de publication',
} as const

/**
 * Copy of the task surfaces
 * @type {Record<string, string>}
 */

export const TASK_COPY = {
  title: 'Tâches',
  lead: 'Une tâche, une date, un responsable, un état.',
  add: 'Créer une tâche',
  emptyTitle: 'Aucune tâche pour le moment.',
  filterTitle: 'Aucune tâche ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer cette tâche ?',
  deleteDescription: 'Elle disparaît du tableau définitivement.',
  missingStates: 'Crée d’abord des états de tâche dans la configuration.',
  mine: 'Mes tâches',
  all: 'Toutes',
  overdue: 'En retard',
  informations: 'Aperçu',
  logsTitle: 'Journal',
  logsEmptyTitle: 'Aucun évènement pour le moment.',
  logsEmptyDescription: 'Les créations et modifications de la tâche apparaîtront ici.',
} as const

/**
 * Labels of the task form
 * @type {Record<string, string>}
 */

export const TASK_FIELD_COPY = {
  title: 'Titre',
  emoji: 'Émoji',
  description: 'Description',
  dueDate: 'Date',
  owner: 'Responsable de la tâche',
  state: 'État',
  priority: 'Priorité',
  youtuber: 'YouTubeur concerné',
  project: 'Projet concerné',
} as const

/**
 * Copy of the meeting surfaces
 * @type {Record<string, string>}
 */

export const MEETING_COPY = {
  title: 'Réunions',
  lead: 'Date, participants et projet concerné pour chaque réunion.',
  add: 'Planifier une réunion',
  emptyTitle: 'Aucune réunion pour le moment.',
  filterTitle: 'Aucune réunion ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer cette réunion ?',
  deleteDescription: 'Elle disparaît du planning définitivement.',
  missingStates: 'Crée d’abord des états de réunion dans la configuration.',
  attendees: 'Participants',
  upcoming: 'À venir',
  past: 'Passées',
  minutes: 'Compte rendu',
  tabOverview: 'Aperçu',
  tabContent: 'Contenu',
  tabLogs: 'Journal',
  informations: 'Informations',
  attendeesTitle: 'Participants',
  introductionTitle: 'Introduction',
  introductionEmpty: 'Aucune introduction pour le moment.',
  topicsTitle: 'Sujets',
  topicsEmptyTitle: 'Aucun sujet pour le moment.',
  topicsEmptyDescription: 'Ajoute les points à couvrir, chacun avec son émoji.',
  topicAdd: 'Ajouter un sujet',
  topicEdit: 'Modifier le sujet',
  topicDeleteTitle: 'Supprimer ce sujet ?',
  topicDeleteDescription: 'Son contenu est perdu définitivement.',
  topicBodyEmpty: 'Aucune note pour ce sujet.',
  outroTitle: 'Outro',
  outroEmpty: 'Aucune conclusion pour le moment.',
  minutesTitle: 'Compte rendu',
  minutesEmpty: 'Aucun compte rendu pour le moment.',
  contentEdit: 'Modifier',
  logsEmptyTitle: 'Aucun évènement pour le moment.',
  logsEmptyDescription: 'Les créations et modifications de la réunion apparaîtront ici.',
} as const

/**
 * Labels of the meeting form
 * @type {Record<string, string>}
 */

export const MEETING_FIELD_COPY = {
  title: 'Titre',
  emoji: 'Émoji',
  scheduledAt: 'Date et heure',
  durationMin: 'Durée en minutes',
  state: 'État',
  youtuber: 'YouTubeur concerné',
  project: 'Projet concerné',
  leads: 'Auditeurs principaux',
  assistants: 'Assistants',
  participants: 'Modérateurs participants',
  introduction: 'Introduction',
  outro: 'Outro',
  minutes: 'Compte rendu',
  peopleEmpty: 'Aucun',
  topicEmoji: 'Émoji',
  topicTitle: 'Titre du sujet',
  topicBody: 'Notes du sujet',
} as const

/**
 * Shared filter labels of the boards
 * @type {Record<string, string>}
 */

export const BOARD_FILTER_COPY = {
  search: 'Titre',
  state: 'État',
  priority: 'Priorité',
  youtuber: 'YouTubeur',
  platform: 'Plateforme',
  project: 'Projet',
  owner: 'Responsable',
  allStates: 'Tous les états',
  allPriorities: 'Toutes les priorités',
  allYoutubers: 'Tous les YouTubeurs',
  allPlatforms: 'Toutes les plateformes',
  allProjects: 'Tous les projets',
  allOwners: 'Tous les responsables',
  board: 'Tableau',
  list: 'Liste',
} as const

/**
 * Singular label and gender of each board scope, driving its toasts
 * @type {Record<WorkflowScopeName, { label: string; gender: 'masculine' | 'feminine' }>}
 */

export const BOARD_ENTITY_COPY: Record<
  WorkflowScopeName,
  { label: string; gender: 'masculine' | 'feminine' }
> = {
  PROJECT: { label: 'Projet', gender: 'masculine' },
  TASK: { label: 'Tâche', gender: 'feminine' },
  MEETING: { label: 'Réunion', gender: 'feminine' },
}

/**
 * Singular label and gender of a meeting topic, driving its toasts
 * @type {{ label: string, gender: 'masculine' | 'feminine' }}
 */

export const MEETING_TOPIC_ENTITY = { label: 'Sujet', gender: 'masculine' } as const
