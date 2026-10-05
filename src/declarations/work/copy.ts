import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Copy of the project surfaces
 * @type {Record<string, string>}
 */

export const PROJECT_COPY = {
  title: 'Projets',
  lead: 'Un projet, un objectif, un responsable, un état.',
  add: 'Créer un projet',
  emptyTitle: 'Aucun projet pour le moment.',
  filterTitle: 'Aucun projet ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Souhaite-tu supprimer ce projet ?',
  deleteDescription: 'Les annonces seront également supprimées. Ses tâches et réunions sont quant à elles détachées.',
  missingStates: 'Crée d’abord des états de projet dans la configuration.',
  tabOverview: 'Aperçu',
  tabCommunication: 'Communication',
  tabTasks: 'Tâches',
  tabMeetings: 'Réunions',
  communicationTitle: 'Communication',
  communicationLead: 'Ce que tu rédiges se transforme en aperçu directement sur Discord.',
  communicationAdd: 'Rédiger une annonce',
  communicationEmptyTitle: 'Aucune annonce pour le moment.',
  communicationDeleteTitle: 'Souhaite-tu supprimer cette annonce ?',
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
 * Explanations behind each project field
 * @type {Record<string, string>}
 */

export const PROJECT_FIELD_INFO = {
  title: 'Le nom court qui identifie le projet sur les tableaux.',
  description: 'Le contexte, l’objectif, et ce qu’on attend à la fin.',
  leads: 'Les personnes qui pilotent le projet et en répondent. Par défaut, toi.',
  assistants: 'Les modérateurs qui prêtent main-forte sans piloter.',
  youtuber: 'Le créateur pour qui le projet est mené.',
  state: 'L’étape où en est le projet.',
  priority: 'L’urgence du projet par rapport aux autres.',
  platform: 'La plateforme où se déroule l’action principale du projet.',
  deadline: 'Le jour où le projet doit être livré.',
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
 * Explanations behind each task field
 * @type {Record<string, string>}
 */

export const TASK_FIELD_INFO = {
  title: 'Ce qu’il y a à faire, en quelques mots.',
  description: 'Les détails utiles pour s’y mettre sans poser de question.',
  dueDate: 'Le jour où la tâche doit être faite.',
  owner: 'La personne qui s’occupe de la tâche. Par défaut, toi.',
  state: 'L’étape où en est la tâche.',
  priority: 'L’urgence de la tâche par rapport aux autres.',
  youtuber: 'Le créateur concerné par la tâche.',
  project: 'Le projet dont la tâche fait partie, s’il y en a un.',
} as const

/**
 * Copy of the meeting surfaces
 * @type {Record<string, string>}
 */

export const MEETING_COPY = {
  title: 'Réunions',
  minuteUnit: 'min',
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
  audience: 'Public attendu',
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
 * Explanations behind each meeting field
 * @type {Record<string, string>}
 */

export const MEETING_FIELD_INFO = {
  title: 'Le sujet de la réunion, tel qu’il apparaîtra au planning.',
  scheduledAt: 'Le jour et l’heure où la réunion commence.',
  durationMin: 'Le temps prévu, en minutes.',
  audience:
    'Toute l’équipe ou une équipe (Discord, Twitch) : la réunion s’affiche sur l’Accueil de chacun de ses membres. Personnalisé : seulement chez les personnes nommées.',
  state: 'L’étape où en est la réunion.',
  youtuber: 'Le créateur concerné par la réunion.',
  project: 'Le projet dont on parle, s’il y en a un.',
  leads: 'Les personnes prévues pour prendre la parole majoritairement.',
  assistants: 'Les personnes qui épaulent les intervenants : notes, partage d’écran, minutage.',
  participants: 'Les modérateurs assistant à cette réunion.',
  introduction: 'Ce qui sera dit en ouverture : le cadre et l’ordre du jour.',
  outro: 'Ce qui sera dit en clôture : les décisions et la suite.',
  minutes: 'Le compte rendu, rédigé après la réunion.',
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
 * Singular label and gender of each board scope
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
 * Singular label and gender of a meeting topic
 * @type {{ label: string, gender: 'masculine' | 'feminine' }}
 */

export const MEETING_TOPIC_ENTITY = { label: 'Sujet', gender: 'masculine' } as const

/**
 * Copy of the Discord announcement composer
 * @type {Record<string, string>}
 */

export const WORK_DISCORD_COPY = {
  membersGroup: 'Membres',
  broadcastGroup: 'Tout le serveur',
  preview: 'Aperçu Discord',
  placeholder: 'Envoyer un message dans #annonces',
  author: 'Annonce',
  today: 'Aujourd’hui',
  copy: 'Copier mon annonce',
  copied: 'Annonce copiée, prête à coller dans Discord',
  unknownUser: 'utilisateur-inconnu',
  unknownRole: 'rôle-inconnu',
  unknownChannel: 'salon-inconnu',
  spoiler: 'Spoiler',
  mentionHint: 'Tape @ pour mentionner un membre ou un rôle, # pour un salon.',
  noMatch: 'Aucune correspondance',
} as const
