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
  socialNetwork: 'Réseau',
  socialNetworkInfo: 'Les réseaux proposés sont ceux déclarés dans la configuration.',
  socialHandle: 'Pseudo',
  socialHandleInfo: 'Le début du lien est fixé par le réseau, tu n’écris que la fin.',
  socialDeleteTitle: 'Supprimer ce réseau ?',
  socialDeleteDescription: 'Le lien disparaît de la fiche, rien d’autre n’est touché.',
  absencesEmptyTitle: 'Aucune absence',
  absencesEmptyDescription: 'Rien de posé pour l’instant.',
  absenceAdd: 'Poser une absence',
  pathLead: 'Les deux fiches qui retracent son passage, de la candidature au suivi.',
  academyFsiTitle: 'Fiche de suivi individuel',
  academyFsiOpen: 'Ouvrir la FSI',
  academyFsiNoneTitle: 'Aucune FSI associée',
  academyFsiNoneDescription: 'Ce modérateur n’a pas de FSI associée.',
  legacyTitle: 'Legacy',
  legacyOpen: 'Ouvrir le parcours',
  legacyNoneTitle: 'Aucun parcours Legacy',
  legacyNoneDescription: 'Ce modérateur ne prépare pas le rôle de Responsable.',
  legacyExempt: 'Dispensé des évènements jusqu’au',
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
  birthdayCelebrated: 'Souhaite être fêté',
  birthdayQuiet: 'Ne souhaite pas être fêté',
  noYoutuber: 'Aucun YouTubeur',
  absent: 'En absence',
  since: 'Depuis le {date}',
  tabOverview: 'Aperçu',
  nowTitle: 'Son activité récente',
  nowFree: 'Disponible',
  nowFreeLead: 'Aucune absence en cours ni prévue.',
  nowAbsent: 'En absence jusqu’au {date}',
  nowNext: 'Prochaine absence : {range}',
  recentTitle: 'Ses dernières logs',
  seeMore: 'Tout voir',
  journeyTitle: 'Son parcours',
  journeyLead: 'Du recrutement au rôle de Responsable, ce qu’il a traversé et où il en est.',
  stageRecruitment: 'Recrutement',
  stageAcademy: 'Academy',
  stageLegacy: 'Legacy',
  railContact: 'Contact',
  railPinned: 'Note épinglée',
  railAssignment: 'Affectation',
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
  memoraId: 'Identifiant Memora',
  role: 'Rôle',
  status: 'Statut',
  division: 'Division',
  dispositif: 'Dispositif',
  youtuber: 'YouTubeurs',
  primaryFunctions: 'Fonctions principales',
  secondaryFunctions: 'Fonctions secondaires',
  email: 'Mail',
  phone: 'Téléphone',
  birthday: 'Date d’anniversaire',
  celebrateBirthday: 'Souhaite être fêté',
  languages: 'Langues',
  timezone: 'Fuseau horaire',
  joinedAt: 'Date d’arrivée',
  leftAt: 'Date de départ',
} as const

/**
 * Explanations behind each moderator field
 * @type {Record<string, string>}
 */

export const MEMBER_FIELD_INFO = {
  displayName: 'Le nom sous lequel l’équipe le connaît.',
  discordId:
    'L’identifiant numérique de son compte Discord, il sert à le reconnaître à la connexion.',
  role: 'Son niveau dans la hiérarchie : modérateur, responsable ou admin.',
  status: 'Où il en est : en attente, en academy, actif, en pause ou parti.',
  division: 'Son rang interne, sans effet sur ses droits.',
  youtuber: 'Les créateurs sur lesquels il intervient.',
  primaryFunctions: 'Ses métiers dans l’équipe, chacun ouvre ses pages spécialisées.',
  secondaryFunctions: 'Des missions en plus, qui ajoutent des pages ou des droits.',
  birthday: 'Le jour de son anniversaire, l’année reste privée.',
  timezone: 'Le fuseau qui sert à caler ses réunions et ses rappels.',
  languages: 'Les langues dans lesquelles il peut modérer.',
  joinedAt: 'Le jour où il a rejoint l’équipe.',
  leftAt: 'Le jour où il est parti, vide tant qu’il est là.',
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

/**
 * Verdicts of an account lookup
 * @type {Record<string, string>}
 */

export const HANDLE_LOOKUP_COPY = {
  checking: 'Recherche du compte…',
  found: 'Compte trouvé',
  missing: 'Aucun compte à ce nom',
  unknown: 'Ce réseau ne laisse pas vérifier le compte',
} as const
