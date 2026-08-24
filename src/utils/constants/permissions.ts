export const Permissions = {
  MemberRead: 'member:read',
  MemberCreate: 'member:create',
  MemberUpdate: 'member:update',
  MemberDelete: 'member:delete',
  MemberNoteRead: 'member:note:read',
  MemberNoteWrite: 'member:note:write',
  MemberLogRead: 'member:log:read',
  ProjectRead: 'project:read',
  ProjectCreate: 'project:create',
  ProjectUpdate: 'project:update',
  ProjectDelete: 'project:delete',
  CommunicationRead: 'communication:read',
  CommunicationWrite: 'communication:write',
  TaskRead: 'task:read',
  TaskCreate: 'task:create',
  TaskUpdate: 'task:update',
  TaskDelete: 'task:delete',
  MeetingRead: 'meeting:read',
  MeetingCreate: 'meeting:create',
  MeetingUpdate: 'meeting:update',
  MeetingDelete: 'meeting:delete',
  AbsenceRead: 'absence:read',
  AbsenceCreate: 'absence:create',
  AbsenceReview: 'absence:review',
  LiveconRead: 'livecon:read',
  LiveconUpdate: 'livecon:update',
  AcademyRead: 'academy:read',
  AcademyManage: 'academy:manage',
  AcademyReviewRead: 'academy:review:read',
  AcademyReviewWrite: 'academy:review:write',
  AcademySkillWrite: 'academy:skill:write',
  AcademyNoteRead: 'academy:note:read',
  AcademyNoteWrite: 'academy:note:write',
  AcademyObjectiveWrite: 'academy:objective:write',
  AcademyReviewValidate: 'academy:review:validate',
  AcademySelfRead: 'academy:self:read',
  AcademyTrainingComplete: 'academy:training:complete',
  CalendarRead: 'calendar:read',
  CalendarManage: 'calendar:manage',
  TeamRead: 'team:read',
  TeamManage: 'team:manage',
  ReferenceRead: 'reference:read',
  ReferenceManage: 'reference:manage',
  AccessManage: 'access:manage',
} as const

export type PermissionName = (typeof Permissions)[keyof typeof Permissions]

/**
 * Permission metadata
 * @typedef {Object} PermissionMeta
 * @property {PermissionName} name - Permission key
 * @property {string} group - Grouping key
 * @property {string} displayName - Display name
 * @property {string} description - Display description
 * @property {boolean} important - Destructive or sensitive
 */

export interface PermissionMeta {
  name: PermissionName
  group: string
  displayName: string
  description: string
  important: boolean
}

/**
 * Permission group keys
 * @type {Record<string, string>}
 */

export const PermissionGroups = {
  Members: 'members',
  Projects: 'projects',
  Tasks: 'tasks',
  Meetings: 'meetings',
  Absences: 'absences',
  Livecon: 'livecon',
  Academy: 'academy',
  Calendar: 'calendar',
  Teams: 'teams',
  Settings: 'settings',
} as const

export type PermissionGroup = (typeof PermissionGroups)[keyof typeof PermissionGroups]

/**
 * Permission catalogue
 * @type {PermissionMeta[]}
 */

export const PermissionsList: PermissionMeta[] = [
  {
    name: Permissions.MemberRead,
    group: PermissionGroups.Members,
    displayName: 'Voir les modérateurs',
    description: 'Ouvrir la liste et les fiches des modérateurs.',
    important: false,
  },
  {
    name: Permissions.MemberCreate,
    group: PermissionGroups.Members,
    displayName: 'Ajouter un modérateur',
    description: 'Créer une fiche et son accès au dashboard.',
    important: true,
  },
  {
    name: Permissions.MemberUpdate,
    group: PermissionGroups.Members,
    displayName: 'Modifier un modérateur',
    description: 'Changer division, fonction, YouTubeur et informations.',
    important: false,
  },
  {
    name: Permissions.MemberDelete,
    group: PermissionGroups.Members,
    displayName: 'Supprimer un modérateur',
    description: 'Retirer définitivement une fiche et son accès.',
    important: true,
  },
  {
    name: Permissions.MemberNoteRead,
    group: PermissionGroups.Members,
    displayName: 'Lire les notes privées',
    description: 'Voir les notes posées sur un modérateur.',
    important: true,
  },
  {
    name: Permissions.MemberNoteWrite,
    group: PermissionGroups.Members,
    displayName: 'Écrire une note privée',
    description: 'Poser ou retirer une note sur un modérateur.',
    important: true,
  },
  {
    name: Permissions.MemberLogRead,
    group: PermissionGroups.Members,
    displayName: 'Lire les logs',
    description: 'Consulter le journal d’activité d’un modérateur.',
    important: false,
  },
  {
    name: Permissions.ProjectRead,
    group: PermissionGroups.Projects,
    displayName: 'Voir les projets',
    description: 'Ouvrir le tableau et les fiches projet.',
    important: false,
  },
  {
    name: Permissions.ProjectCreate,
    group: PermissionGroups.Projects,
    displayName: 'Créer un projet',
    description: 'Ouvrir un nouveau projet.',
    important: false,
  },
  {
    name: Permissions.ProjectUpdate,
    group: PermissionGroups.Projects,
    displayName: 'Modifier un projet',
    description: 'Changer état, priorité, deadline et équipe.',
    important: false,
  },
  {
    name: Permissions.ProjectDelete,
    group: PermissionGroups.Projects,
    displayName: 'Supprimer un projet',
    description: 'Retirer définitivement un projet.',
    important: true,
  },
  {
    name: Permissions.CommunicationRead,
    group: PermissionGroups.Projects,
    displayName: 'Voir les communications',
    description: 'Lire les annonces rédigées sur un projet.',
    important: false,
  },
  {
    name: Permissions.CommunicationWrite,
    group: PermissionGroups.Projects,
    displayName: 'Rédiger une communication',
    description: 'Écrire et publier une annonce de projet.',
    important: false,
  },
  {
    name: Permissions.TaskRead,
    group: PermissionGroups.Tasks,
    displayName: 'Voir les tâches',
    description: 'Ouvrir le tableau des tâches.',
    important: false,
  },
  {
    name: Permissions.TaskCreate,
    group: PermissionGroups.Tasks,
    displayName: 'Créer une tâche',
    description: 'Ajouter une tâche et l’attribuer.',
    important: false,
  },
  {
    name: Permissions.TaskUpdate,
    group: PermissionGroups.Tasks,
    displayName: 'Modifier une tâche',
    description: 'Changer état, date et responsable.',
    important: false,
  },
  {
    name: Permissions.TaskDelete,
    group: PermissionGroups.Tasks,
    displayName: 'Supprimer une tâche',
    description: 'Retirer définitivement une tâche.',
    important: true,
  },
  {
    name: Permissions.MeetingRead,
    group: PermissionGroups.Meetings,
    displayName: 'Voir les réunions',
    description: 'Consulter le planning des réunions.',
    important: false,
  },
  {
    name: Permissions.MeetingCreate,
    group: PermissionGroups.Meetings,
    displayName: 'Planifier une réunion',
    description: 'Créer une réunion et convoquer des participants.',
    important: false,
  },
  {
    name: Permissions.MeetingUpdate,
    group: PermissionGroups.Meetings,
    displayName: 'Modifier une réunion',
    description: 'Changer date, état et participants.',
    important: false,
  },
  {
    name: Permissions.MeetingDelete,
    group: PermissionGroups.Meetings,
    displayName: 'Supprimer une réunion',
    description: 'Retirer définitivement une réunion.',
    important: true,
  },
  {
    name: Permissions.AbsenceRead,
    group: PermissionGroups.Absences,
    displayName: 'Voir toutes les absences',
    description: 'Consulter les absences de toute l’équipe.',
    important: false,
  },
  {
    name: Permissions.AbsenceCreate,
    group: PermissionGroups.Absences,
    displayName: 'Poser une absence',
    description: 'Déclarer sa propre absence.',
    important: false,
  },
  {
    name: Permissions.AbsenceReview,
    group: PermissionGroups.Absences,
    displayName: 'Traiter une absence',
    description: 'Valider ou refuser une demande.',
    important: true,
  },
  {
    name: Permissions.LiveconRead,
    group: PermissionGroups.Livecon,
    displayName: 'Voir le livecon',
    description: 'Consulter le niveau de vigilance courant.',
    important: false,
  },
  {
    name: Permissions.LiveconUpdate,
    group: PermissionGroups.Livecon,
    displayName: 'Changer le livecon',
    description: 'Basculer le niveau de vigilance d’un YouTubeur.',
    important: true,
  },
  {
    name: Permissions.AcademyRead,
    group: PermissionGroups.Academy,
    displayName: 'Voir la Marsha Academy',
    description: 'Suivre les juniors et leurs formations.',
    important: false,
  },
  {
    name: Permissions.AcademyManage,
    group: PermissionGroups.Academy,
    displayName: 'Piloter la Marsha Academy',
    description: 'Ouvrir une session, y placer des juniors et les valider.',
    important: true,
  },
  {
    name: Permissions.AcademyReviewRead,
    group: PermissionGroups.Academy,
    displayName: 'Lire les bilans vocaux',
    description: 'Ouvrir les traces écrites des bilans tenus avec un junior.',
    important: true,
  },
  {
    name: Permissions.AcademyReviewWrite,
    group: PermissionGroups.Academy,
    displayName: 'Tenir un bilan vocal',
    description: 'Écrire la trace d’un bilan et fixer les objectifs suivants.',
    important: true,
  },
  {
    name: Permissions.AcademySkillWrite,
    group: PermissionGroups.Academy,
    displayName: 'Noter les compétences',
    description: 'Faire évoluer le pourcentage de maîtrise d’une compétence.',
    important: false,
  },
  {
    name: Permissions.AcademyNoteRead,
    group: PermissionGroups.Academy,
    displayName: 'Lire les notes de FSI',
    description: 'Ouvrir les remarques posées sur le suivi d’un junior.',
    important: true,
  },
  {
    name: Permissions.AcademyNoteWrite,
    group: PermissionGroups.Academy,
    displayName: 'Écrire une note de FSI',
    description: 'Poser ou retirer une remarque sur le suivi d’un junior.',
    important: true,
  },
  {
    name: Permissions.AcademyObjectiveWrite,
    group: PermissionGroups.Academy,
    displayName: 'Fixer les objectifs',
    description: 'Créer, modifier et réordonner les objectifs personnels.',
    important: false,
  },
  {
    name: Permissions.AcademyReviewValidate,
    group: PermissionGroups.Academy,
    displayName: 'Décider d’un bilan',
    description: 'Valider ou refuser un bilan soumis, ce qui fait avancer la FSI.',
    important: true,
  },
  {
    name: Permissions.AcademySelfRead,
    group: PermissionGroups.Academy,
    displayName: 'Voir sa propre FSI',
    description: 'Ouvrir sa propre fiche de suivi individuel.',
    important: false,
  },
  {
    name: Permissions.AcademyTrainingComplete,
    group: PermissionGroups.Academy,
    displayName: 'Suivre ses formations',
    description: 'Démarrer, reprendre et terminer ses propres formations.',
    important: false,
  },
  {
    name: Permissions.CalendarRead,
    group: PermissionGroups.Calendar,
    displayName: 'Voir le calendrier',
    description: 'Ouvrir le calendrier partagé, filtré sur ce qui est visible.',
    important: false,
  },
  {
    name: Permissions.CalendarManage,
    group: PermissionGroups.Calendar,
    displayName: 'Gérer le calendrier',
    description: 'Poser, déplacer et supprimer une entrée du calendrier.',
    important: false,
  },
  {
    name: Permissions.TeamRead,
    group: PermissionGroups.Teams,
    displayName: 'Voir les équipes',
    description: 'Consulter la composition des équipes.',
    important: false,
  },
  {
    name: Permissions.TeamManage,
    group: PermissionGroups.Teams,
    displayName: 'Gérer les équipes',
    description: 'Créer une équipe et déplacer ses membres.',
    important: true,
  },
  {
    name: Permissions.ReferenceRead,
    group: PermissionGroups.Settings,
    displayName: 'Voir la configuration',
    description: 'Consulter divisions, fonctions, YouTubeurs et états.',
    important: false,
  },
  {
    name: Permissions.ReferenceManage,
    group: PermissionGroups.Settings,
    displayName: 'Gérer la configuration',
    description: 'Créer et modifier les données de référence.',
    important: true,
  },
  {
    name: Permissions.AccessManage,
    group: PermissionGroups.Settings,
    displayName: 'Gérer les accès',
    description: 'Attribuer les permissions par rôle et par fonction.',
    important: true,
  },
]

/**
 * Permission lookup
 * @type {Map<PermissionName, PermissionMeta>}
 */

const PERMISSION_INDEX = new Map(PermissionsList.map((entry) => [entry.name, entry]))

/**
 * Read permission metadata
 * @param {PermissionName} name - Permission key
 * @return {PermissionMeta | undefined} - Metadata
 */

export const permissionMeta = (name: PermissionName): PermissionMeta | undefined =>
  PERMISSION_INDEX.get(name)

/**
 * Check known permission
 * @param {string} candidate - Raw string
 * @return {boolean} - Known permission
 */

export const isPermissionName = (candidate: string): candidate is PermissionName =>
  PERMISSION_INDEX.has(candidate as PermissionName)

/**
 * Check any permission
 * @param {PermissionName[]} userPermissions - Permissions held
 * @param {PermissionName | PermissionName[]} required - Permission needed
 * @return {boolean} - Has permission
 */

export function hasPermission(
  userPermissions: PermissionName[],
  required: PermissionName | PermissionName[]
): boolean {
  if (typeof required === 'string') return userPermissions.includes(required)

  return required.some((permission) => userPermissions.includes(permission))
}

/**
 * Check all permissions
 * @param {PermissionName[]} userPermissions - Permissions held
 * @param {PermissionName[]} required - Permissions needed
 * @return {boolean} - Has all
 */

export function hasEveryPermission(
  userPermissions: PermissionName[],
  required: PermissionName[]
): boolean {
  return required.every((permission) => userPermissions.includes(permission))
}
