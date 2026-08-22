/**
 * Copy of the moderator surfaces
 * @type {Record<string, string>}
 */

export const MEMBER_COPY = {
  title: 'Modérateurs',
  lead: 'Chaque fiche regroupe l’affectation, les infos, les notes, les absences et les logs.',
  add: 'Ajouter un modérateur',
  emptyTitle: 'Aucun modérateur',
  emptyDescription: 'Ajoute une première fiche pour ouvrir un accès au dashboard.',
  filterTitle: 'Aucun modérateur ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Supprimer ce modérateur ?',
  deleteDescription: 'Sa fiche, ses notes et son accès disparaissent définitivement.',
  rootLocked: 'Ce compte ne peut pas être manipulé.',
  tabIdentity: 'Fiche',
  tabNotes: 'Notes privées',
  tabAbsences: 'Absences',
  tabSocials: 'Réseaux',
  tabAcademy: 'Academy',
  tabLogs: 'Logs',
  identity: 'Identité',
  assignment: 'Affectation',
  contact: 'Contact',
  activity: 'Activité',
  notesTitle: 'Notes privées',
  notesLead: 'Visibles par les responsables uniquement.',
  notesEmptyTitle: 'Aucune note',
  notesEmptyDescription: 'Pose une première note pour garder une trace de son suivi.',
  noteField: 'Note',
  noteAdd: 'Ajouter une note',
  notePin: 'Épingler',
  noteUnpin: 'Désépingler',
  pimsTitle: 'PIM',
  pimsLead: 'Date de la PIM et fiche associée.',
  pimsEmptyTitle: 'Aucune PIM',
  pimsEmptyDescription: 'Enregistre une PIM pour garder sa fiche au même endroit.',
  pimAdd: 'Enregistrer une PIM',
  pimDate: 'Date de la PIM',
  pimSheet: 'Fiche',
  socialsTitle: 'Réseaux sociaux',
  socialsLead: 'Un pseudo par réseau déclaré dans la configuration.',
  socialsEmptyTitle: 'Aucun réseau',
  socialsEmptyDescription: 'Renseigne ses pseudos pour le retrouver ailleurs.',
  socialsEdit: 'Modifier les réseaux',
  socialsMissing: 'Ajoute d’abord des réseaux dans la configuration.',
  absencesEmptyTitle: 'Aucune absence',
  absencesEmptyDescription: 'Rien de posé pour l’instant.',
  academyEmptyTitle: 'Aucune formation',
  academyEmptyDescription:
    'Déclare des formations dans la configuration pour suivre sa progression.',
  logsEmptyTitle: 'Aucun log',
  logsEmptyDescription: 'Ses actions apparaîtront ici au fil de l’eau.',
  projects: 'projets',
  tasks: 'tâches',
  meetings: 'réunions',
  accessTitle: 'Permissions',
  accessLead: 'Ajoute ou retire une permission pour ce compte uniquement.',
  accessInherited: 'Hérité du rôle et des fonctions',
  accessSave: 'Enregistrer les permissions',
  birthdayCelebrated: 'Anniversaire fêté',
  birthdayQuiet: 'Anniversaire discret',
  noYoutuber: 'Aucun YouTubeur',
  noDivision: 'Aucune division',
  noFunction: 'Aucune fonction',
} as const

/**
 * Labels of the moderator form
 * @type {Record<string, string>}
 */

export const MEMBER_FIELD_COPY = {
  displayName: 'Nom affiché',
  discordId: 'Identifiant Discord',
  discordIdHint: 'Clic droit sur son profil Discord puis « Copier l’identifiant ».',
  role: 'Rôle',
  status: 'Statut',
  academyPeriod: 'Période',
  division: 'Division',
  youtuber: 'YouTubeur',
  primaryFunction: 'Fonction principale',
  secondaryFunction: 'Fonction secondaire',
  email: 'Mail',
  phone: 'Téléphone',
  birthday: 'Date d’anniversaire',
  celebrateBirthday: 'Il veut que son anniversaire soit fêté',
  languages: 'Langues',
  languagesHint: 'Entrée ou virgule pour valider une langue.',
  timezone: 'Fuseau horaire',
  avatarUrl: 'Photo',
  joinedAt: 'Date d’arrivée',
  leftAt: 'Date de départ',
} as const

/**
 * Filter labels of the moderator list
 * @type {Record<string, string>}
 */

export const MEMBER_FILTER_COPY = {
  search: 'Nom ou identifiant',
  role: 'Rôle',
  status: 'Statut',
  division: 'Division',
  youtuber: 'YouTubeur',
  jobFunction: 'Fonction',
  allRoles: 'Tous les rôles',
  allStatuses: 'Tous les statuts',
  allDivisions: 'Toutes les divisions',
  allYoutubers: 'Tous les YouTubeurs',
  allFunctions: 'Toutes les fonctions',
  count: 'modérateurs',
  countOne: 'modérateur',
} as const
