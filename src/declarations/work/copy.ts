/**
 * Copy of the project surfaces
 * @type {Record<string, string>}
 */

export const PROJECT_COPY = {
  title: 'Projets',
  lead: 'Chaque projet porte son YouTubeur, son état, sa priorité, sa deadline et son équipe.',
  add: 'Créer un projet',
  emptyTitle: 'Aucun projet',
  emptyDescription: 'Ouvre un premier projet pour commencer à le suivre sur le tableau.',
  emptyColumn: 'Rien ici',
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
  communicationEmptyTitle: 'Aucune annonce',
  communicationEmptyDescription: 'Rédige la première annonce du projet.',
  communicationDeleteTitle: 'Supprimer cette annonce ?',
  communicationDeleteDescription: 'Le texte est perdu définitivement.',
  published: 'Publiée',
  draft: 'Brouillon',
  team: 'Équipe du projet',
  noLead: 'Aucun responsable',
} as const

/**
 * Labels of the project form
 * @type {Record<string, string>}
 */

export const PROJECT_FIELD_COPY = {
  title: 'Titre',
  description: 'Description',
  youtuber: 'YouTubeur concerné',
  state: 'État',
  priority: 'Priorité',
  platform: 'Plateforme',
  platformHint: 'Là où l’action initiale se déroule.',
  deadline: 'Deadline',
  lead: 'Responsable du projet',
  assistants: 'Assistants du projet',
  assistantsEmpty: 'Ajoute d’abord des modérateurs.',
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
  emptyTitle: 'Aucune tâche',
  emptyDescription: 'Ajoute une première tâche et attribue-la.',
  emptyColumn: 'Rien ici',
  filterTitle: 'Aucune tâche ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer cette tâche ?',
  deleteDescription: 'Elle disparaît du tableau définitivement.',
  missingStates: 'Crée d’abord des états de tâche dans la configuration.',
  mine: 'Mes tâches',
  all: 'Toutes',
  overdue: 'En retard',
} as const

/**
 * Labels of the task form
 * @type {Record<string, string>}
 */

export const TASK_FIELD_COPY = {
  title: 'Titre',
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
  emptyTitle: 'Aucune réunion',
  emptyDescription: 'Planifie la première réunion et convoque ton équipe.',
  emptyColumn: 'Rien ici',
  filterTitle: 'Aucune réunion ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer cette réunion ?',
  deleteDescription: 'Elle disparaît du planning définitivement.',
  missingStates: 'Crée d’abord des états de réunion dans la configuration.',
  attendees: 'Participants',
  upcoming: 'À venir',
  past: 'Passées',
  minutes: 'Compte rendu',
} as const

/**
 * Labels of the meeting form
 * @type {Record<string, string>}
 */

export const MEETING_FIELD_COPY = {
  title: 'Titre',
  scheduledAt: 'Date et heure',
  durationMin: 'Durée en minutes',
  state: 'État',
  youtuber: 'YouTubeur concerné',
  project: 'Projet concerné',
  leads: 'Auditeurs principaux',
  assistants: 'Assistants',
  participants: 'Modérateurs participants',
  agenda: 'Ordre du jour',
  minutes: 'Compte rendu',
  peopleEmpty: 'Ajoute d’abord des modérateurs.',
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
