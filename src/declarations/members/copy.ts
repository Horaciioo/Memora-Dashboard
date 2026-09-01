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
  deleteTitle: 'Fermer l’accès de ce modérateur ?',
  deleteDescription:
    'Son accès est coupé et ses informations privées effacées. Son pseudo et son historique restent.',
  rootLocked: 'Ce compte ne peut pas être manipulé.',
  tabIdentity: 'Fiche',
  tabNotes: 'Notes',
  tabAbsences: 'Absences',
  tabSocials: 'Réseaux',
  tabAccess: 'Permissions',
  tabPath: 'Parcours',
  tabLogs: 'Logs',
  identity: 'Identité',
  assignment: 'Affectation',
  contact: 'Contact',
  activity: 'Activité',
  notesTitle: 'Notes',
  notesLead: 'Remarques privées, visibles des seuls responsables habilités.',
  notesEmptyTitle: 'Aucune note',
  notesEmptyDescription: 'Pose une première note pour garder une trace de son suivi.',
  noteField: 'Note',
  noteAdd: 'Ajouter une note',
  notePin: 'Épingler',
  noteUnpin: 'Désépingler',
  socialsTitle: 'Réseaux sociaux',
  socialsLead: 'Chacun ajoute et tient ses propres réseaux depuis sa fiche.',
  socialsEmptyTitle: 'Aucun réseau',
  socialsEmptyDescription: 'Ajoute un premier réseau pour qu’on te retrouve ailleurs.',
  socialAdd: 'Ajouter un réseau',
  socialEdit: 'Modifier ce réseau',
  socialLabel: 'Réseau',
  socialHandle: 'Pseudo',
  socialUrl: 'Lien du profil',
  socialAccent: 'Couleur',
  socialDeleteTitle: 'Supprimer ce réseau ?',
  socialDeleteDescription: 'Le lien disparaît de la fiche, rien d’autre n’est touché.',
  absencesEmptyTitle: 'Aucune absence',
  absencesEmptyDescription: 'Rien de posé pour l’instant.',
  pathLead: 'Les deux fiches qui retracent son passage, de la candidature au suivi.',
  academyFsiTitle: 'Fiche de suivi individuel',
  academyFsiOpen: 'Ouvrir la FSI',
  academyFsiNoneTitle: 'Aucune FSI associée',
  academyFsiNoneDescription: 'Ce modérateur n’a pas de FSI associée.',
  recruitmentTitle: 'Fiche de recrutement',
  recruitmentOpen: 'Ouvrir le recrutement',
  recruitmentNoneTitle: 'Aucune fiche de recrutement',
  recruitmentNoneDescription: 'Aucune candidature ne porte son identifiant Discord.',
  logsEmptyTitle: 'Aucun log',
  logsEmptyDescription: 'Ses actions apparaîtront ici au fil de l’eau.',
  accessTitle: 'Permissions',
  accessLead: 'Ajoute ou retire une permission pour ce compte uniquement.',
  accessInherited: 'Hérité du rôle et des fonctions',
  accessSave: 'Enregistrer les permissions',
  birthdayCelebrated: 'Anniversaire fêté',
  birthdayQuiet: 'Anniversaire discret',
  noYoutuber: 'Aucun YouTubeur',
  noFunction: 'Aucune fonction',
  absentHint: '{name} est actuellement en absence.',
} as const

/**
 * Labels of the moderator form
 * @type {Record<string, string>}
 */

export const MEMBER_FIELD_COPY = {
  displayName: 'Nom affiché',
  discordId: 'Identifiant Discord',
  role: 'Rôle',
  status: 'Statut',
  division: 'Division',
  youtuber: 'YouTubeurs',
  primaryFunction: 'Fonction principale',
  secondaryFunction: 'Fonction secondaire',
  email: 'Mail',
  phone: 'Téléphone',
  birthday: 'Date d’anniversaire',
  celebrateBirthday: 'Il veut que son anniversaire soit fêté',
  languages: 'Langues',
  timezone: 'Fuseau horaire',
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
} as const
