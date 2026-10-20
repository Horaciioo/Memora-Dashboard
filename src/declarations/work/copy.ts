import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * Wording of the project opened for a recruitment and its academy
 * @type {Record<string, string>}
 */

export const PROGRAM_PROJECT_COPY = {
  titlePrefix: 'Recrutement et Academy, ',
  recruitment: 'Recrutement',
  academy: 'Academy',
  launch: 'Lancer le PIM de la promotion',
  secondPeriod: 'Lancer la période 2',
  close: 'Clôturer la promotion',
} as const

/**
 * Copy of the project surfaces
 * @type {Record<string, string>}
 */

export const PROJECT_COPY = {
  title: 'Projets',
  heroDescription: 'Tout en un endroit',
  lead: 'Un projet, un objectif, un responsable, un état.',
  add: 'Créer un projet',
  emptyTitle: 'Aucun projet pour le moment.',
  filterTitle: 'Aucun projet ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Souhaite-tu supprimer ce projet ?',
  deleteDescription:
    'Les annonces seront également supprimées. Ses tâches et réunions sont quant à elles détachées.',
  missingStates: 'Crée d’abord des états de projet dans la configuration.',
  tabOverview: 'Aperçu',
  tabCommunication: 'Communication',
  tabTasks: 'Tâches',
  tabMeetings: 'Réunions',
  communicationTitle: 'Communication',
  communicationLead: 'Ce que tu rédiges se transforme en aperçu directement sur Discord.',
  communicationAdd: 'Rédiger une annonce',
  communicationPreview: 'Aperçu',
  communicationEmptyTitle: 'Aucune annonce pour le moment.',
  communicationDeleteTitle: 'Souhaite-tu supprimer cette annonce ?',
  communicationDeleteDescription: 'Le texte est perdu définitivement.',
  inCharge: 'En charge :',
  status: 'Statut :',
  published: 'Publiée',
  draft: 'Brouillon',
  informations: 'Informations',
  descriptionEmpty: 'Clique pour rédiger la description du projet.',
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
  youtubers: 'YouTubeurs concernés',
  youtubersEmpty: 'Aucun',
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
  communicationStatus: 'Statut',
  communicationAuthor: 'Auteur',
  communicationProject: 'Projet',
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
  youtubers: 'Les créateurs pour qui le projet est mené.',
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
  heroDescription: 'Tout ce qu’il faut que tu fasses',
  lead: 'Une tâche, une date, un responsable, un état.',
  add: 'Créer une tâche',
  emptyTitle: 'Aucune tâche pour le moment.',
  filterTitle: 'Aucune tâche ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer cette tâche ?',
  deleteDescription: 'Elle disparaît du tableau définitivement.',
  missingStates: 'Crée d’abord des états de tâche dans la configuration.',
  mine: 'Mes tâches',
  markDone: 'Marquer comme faite',
  markUndone: 'Marquer comme à faire',
  systemTag: 'SYSTÈME',
  noProject: 'Aucun projet',
  openSystem: 'Ouvrir la page concernée',
  systemInfo: 'Tâche ouverte et tenue à jour automatiquement : tu peux seulement la cocher.',
  validate: 'Valider la tâche',
  validated: 'Tâche validée',
  all: 'Toutes',
  overdue: 'En retard',
  informations: 'Aperçu',
  descriptionEmpty: 'Clique pour rédiger la description de la tâche.',
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
  youtubers: 'YouTubeurs concernés',
  youtubersEmpty: 'Aucun',
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
  youtubers: 'Les créateurs concernés par la tâche.',
  project: 'Le projet dont la tâche fait partie, s’il y en a un.',
} as const

/**
 * Copy of the meeting surfaces
 * @type {Record<string, string>}
 */

export const MEETING_COPY = {
  title: 'Réunions',
  heroDescription: 'Tous tes vocaux',
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
  youtubers: 'YouTubeurs concernés',
  youtubersEmpty: 'Aucun',
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
  youtubers: 'Les créateurs concernés par la réunion.',
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

/**
 * Words raised by a deadline gone by
 * @type {Record<string, string>}
 */

export const DEADLINE_COPY = {
  project: 'Ce projet est hors deadline !',
  task: 'Cette tâche est hors deadline !',
  meeting: 'Cette réunion est hors deadline !',
} as const

/**
 * Bubble beside Recrutement when a comment names the member
 * @type {string}
 */

export const MENTION_NUDGE_COPY = '{name} t’a mentionné sur un commentaire !'

// Author not known
export const MENTION_NUDGE_SOMEONE = 'Quelqu’un'

/**
 * Bubble beside a page holding late items of the member
 * @type {Record<string, string>}
 */

export const DEADLINE_NUDGE_COPY = {
  projects: 'Un de tes projets est hors deadline !',
  tasks: 'Une de tes tâches est hors deadline !',
  meetings: 'Une de tes réunions est hors deadline !',
} as const

/**
 * Singular label and gender of a board selection
 * @type {{ label: string, gender: 'feminine' }}
 */

export const SELECTION_ENTITY = { label: 'Sélection', gender: 'feminine' } as const

/**
 * Copy of the board selection bar
 * @type {Record<string, string>}
 */

export const SELECTION_COPY = {
  label: 'Sélection en cours',
  search: 'Rechercher des actions…',
  none: 'Aucune action',
  count: (count: number) =>
    `${count} ${count > 1 ? 'éléments sélectionnés' : 'élément sélectionné'}`,
  select: 'Sélectionner',
  deselect: 'Désélectionner',
  clear: 'Tout désélectionner',
  edit: 'Modifier la sélection',
  delete: 'Supprimer la sélection',
  deleteTitle: 'Supprimer la sélection ?',
  deleteDescription: 'Tout ce qui est sélectionné disparaît définitivement.',
} as const
