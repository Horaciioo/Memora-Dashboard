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
  LiveRead: 'live:read',
  LiveAnnounce: 'live:announce',
  LiveModerate: 'live:moderate',
  LiveUnbanRequest: 'live:unban-request',
  LiveModeShield: 'live:mode:shield',
  LiveModeSubscribers: 'live:mode:subscribers',
  LiveModeFollowers: 'live:mode:followers',
  LiveModeEmotes: 'live:mode:emotes',
  LiveModeSlow: 'live:mode:slow',
  LiveTerms: 'live:terms',
  LiveCrisisChat: 'live:crisis-chat',
  LiveLogRead: 'live:log:read',
  LiveCreatorReport: 'live:creator-report',
  LiveRoster: 'live:roster',
  LiveInspect: 'live:inspect',
  LiveFocus: 'live:focus',
  SanctionRead: 'sanction:read',
  SanctionManage: 'sanction:manage',
  RecruitmentRead: 'recruitment:read',
  RecruitmentManage: 'recruitment:manage',
  RecruitmentCandidateWrite: 'recruitment:candidate:write',
  RecruitmentInstructionWrite: 'recruitment:instruction:write',
  IntegrationManage: 'integration:manage',
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
  LegacyRead: 'legacy:read',
  LegacyManage: 'legacy:manage',
  LegacySelf: 'legacy:self',
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
 * @property {PermissionName} [parent] - Page permission this one refines
 */

export interface PermissionMeta {
  name: PermissionName
  group: string
  displayName: string
  description: string
  important: boolean
  parent?: PermissionName
}

/**
 * Permission group keys, one per navigation page
 * @type {Record<string, string>}
 */

export const PermissionGroups = {
  Members: 'members',
  Projects: 'projects',
  Tasks: 'tasks',
  Meetings: 'meetings',
  Absences: 'absences',
  Calendar: 'calendar',
  Livecon: 'livecon',
  Live: 'live',
  Sanctions: 'sanctions',
  Recruitment: 'recruitment',
  Academy: 'academy',
  Legacy: 'legacy',
  Teams: 'teams',
  Configuration: 'configuration',
  Access: 'access',
} as const

export type PermissionGroup = (typeof PermissionGroups)[keyof typeof PermissionGroups]

/**
 * Permission catalogue — one root permission per page, its refinements carrying a parent
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
    parent: Permissions.MemberRead,
  },
  {
    name: Permissions.MemberUpdate,
    group: PermissionGroups.Members,
    displayName: 'Modifier un modérateur',
    description: 'Changer division, fonction, YouTubeur et informations.',
    important: false,
    parent: Permissions.MemberRead,
  },
  {
    name: Permissions.MemberDelete,
    group: PermissionGroups.Members,
    displayName: 'Supprimer un modérateur',
    description: 'Retirer définitivement une fiche et son accès.',
    important: true,
    parent: Permissions.MemberRead,
  },
  {
    name: Permissions.MemberNoteRead,
    group: PermissionGroups.Members,
    displayName: 'Lire les notes privées',
    description: 'Voir les notes posées sur un modérateur.',
    important: true,
    parent: Permissions.MemberRead,
  },
  {
    name: Permissions.MemberNoteWrite,
    group: PermissionGroups.Members,
    displayName: 'Écrire une note privée',
    description: 'Poser ou retirer une note sur un modérateur.',
    important: true,
    parent: Permissions.MemberRead,
  },
  {
    name: Permissions.MemberLogRead,
    group: PermissionGroups.Members,
    displayName: 'Lire les logs',
    description: 'Consulter le journal d’activité d’un modérateur.',
    important: false,
    parent: Permissions.MemberRead,
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
    parent: Permissions.ProjectRead,
  },
  {
    name: Permissions.ProjectUpdate,
    group: PermissionGroups.Projects,
    displayName: 'Modifier un projet',
    description: 'Changer état, priorité, deadline et équipe.',
    important: false,
    parent: Permissions.ProjectRead,
  },
  {
    name: Permissions.ProjectDelete,
    group: PermissionGroups.Projects,
    displayName: 'Supprimer un projet',
    description: 'Retirer définitivement un projet.',
    important: true,
    parent: Permissions.ProjectRead,
  },
  {
    name: Permissions.CommunicationRead,
    group: PermissionGroups.Projects,
    displayName: 'Voir les communications',
    description: 'Lire les annonces rédigées sur un projet.',
    important: false,
    parent: Permissions.ProjectRead,
  },
  {
    name: Permissions.CommunicationWrite,
    group: PermissionGroups.Projects,
    displayName: 'Rédiger une communication',
    description: 'Écrire et publier une annonce de projet.',
    important: false,
    parent: Permissions.ProjectRead,
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
    parent: Permissions.TaskRead,
  },
  {
    name: Permissions.TaskUpdate,
    group: PermissionGroups.Tasks,
    displayName: 'Modifier une tâche',
    description: 'Changer état, date et responsable.',
    important: false,
    parent: Permissions.TaskRead,
  },
  {
    name: Permissions.TaskDelete,
    group: PermissionGroups.Tasks,
    displayName: 'Supprimer une tâche',
    description: 'Retirer définitivement une tâche.',
    important: true,
    parent: Permissions.TaskRead,
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
    parent: Permissions.MeetingRead,
  },
  {
    name: Permissions.MeetingUpdate,
    group: PermissionGroups.Meetings,
    displayName: 'Modifier une réunion',
    description: 'Changer date, état et participants.',
    important: false,
    parent: Permissions.MeetingRead,
  },
  {
    name: Permissions.MeetingDelete,
    group: PermissionGroups.Meetings,
    displayName: 'Supprimer une réunion',
    description: 'Retirer définitivement une réunion.',
    important: true,
    parent: Permissions.MeetingRead,
  },
  {
    name: Permissions.AbsenceCreate,
    group: PermissionGroups.Absences,
    displayName: 'Poser une absence',
    description: 'Déclarer sa propre absence.',
    important: false,
  },
  {
    name: Permissions.AbsenceRead,
    group: PermissionGroups.Absences,
    displayName: 'Voir toutes les absences',
    description: 'Consulter les absences de toute l’équipe.',
    important: false,
  },
  {
    name: Permissions.AbsenceReview,
    group: PermissionGroups.Absences,
    displayName: 'Traiter une absence',
    description: 'Valider ou refuser une demande.',
    important: true,
    parent: Permissions.AbsenceRead,
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
    parent: Permissions.CalendarRead,
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
    parent: Permissions.LiveconRead,
  },
  {
    name: Permissions.LiveRead,
    group: PermissionGroups.Live,
    displayName: 'Voir les lives',
    description: 'Ouvrir la page Live en cours d’un live annoncé ou en cours, et sa Mod View.',
    important: false,
  },
  {
    name: Permissions.LiveAnnounce,
    group: PermissionGroups.Live,
    displayName: 'Annoncer un live',
    description: 'Annoncer un live, choisir son Coordinateur, le lancer ou le clore à la main.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModerate,
    group: PermissionGroups.Live,
    displayName: 'Modérer un live',
    description: 'Supprimer, avertir, exclure, bannir et débannir depuis la Mod View.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveUnbanRequest,
    group: PermissionGroups.Live,
    displayName: 'Traiter les demandes de débannissement',
    description: 'Accepter ou refuser une demande de débannissement.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModeShield,
    group: PermissionGroups.Live,
    displayName: 'Mode bouclier',
    description: 'Activer ou couper le mode bouclier du chat.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModeSubscribers,
    group: PermissionGroups.Live,
    displayName: 'Chat réservé aux abonnés',
    description: 'Activer ou couper le chat réservé aux abonnés.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModeFollowers,
    group: PermissionGroups.Live,
    displayName: 'Réservé aux followers',
    description: 'Activer ou couper le chat réservé aux followers.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModeEmotes,
    group: PermissionGroups.Live,
    displayName: 'Chat en émoticônes uniquement',
    description: 'Activer ou couper le chat en émoticônes uniquement.',
    important: false,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveModeSlow,
    group: PermissionGroups.Live,
    displayName: 'Mode lent',
    description: 'Activer, régler ou couper le mode lent.',
    important: false,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveTerms,
    group: PermissionGroups.Live,
    displayName: 'Termes bloqués et autorisés',
    description: 'Ajouter, modifier ou retirer un terme bloqué ou autorisé.',
    important: false,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveCrisisChat,
    group: PermissionGroups.Live,
    displayName: 'Parler en Livecon 1',
    description: 'Écrire dans le chat alors que le Livecon 1 est en vigueur.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveLogRead,
    group: PermissionGroups.Live,
    displayName: 'Voir les logs et le bilan',
    description: 'Consulter les logs de modération d’un live et son bilan final.',
    important: false,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveCreatorReport,
    group: PermissionGroups.Live,
    displayName: 'Bilan créateur',
    description: 'Ouvrir et partager le bilan destiné au créateur.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveRoster,
    group: PermissionGroups.Live,
    displayName: 'Corriger l’appel d’un live',
    description: 'Glisser un membre entre Présent et Non présent sur l’appel d’un live.',
    important: false,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveInspect,
    group: PermissionGroups.Live,
    displayName: 'Inspect Mod',
    description:
      'Ouvrir l’activité d’un modérateur pendant un live : sanctions, présence, absence.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.LiveFocus,
    group: PermissionGroups.Live,
    displayName: 'Mode Focus',
    description:
      'Suivre en temps réel les gestes d’un modérateur et agir à sa place. Un Formateur ne suit que les Juniors.',
    important: true,
    parent: Permissions.LiveRead,
  },
  {
    name: Permissions.SanctionRead,
    group: PermissionGroups.Sanctions,
    displayName: 'Voir le panel de sanctions',
    description: 'Consulter le barème des sanctions d’un YouTubeur.',
    important: false,
  },
  {
    name: Permissions.SanctionManage,
    group: PermissionGroups.Sanctions,
    displayName: 'Gérer le panel de sanctions',
    description: 'Modifier les infractions, leurs exemples et leur barème.',
    important: true,
    parent: Permissions.SanctionRead,
  },
  {
    name: Permissions.RecruitmentRead,
    group: PermissionGroups.Recruitment,
    displayName: 'Voir les recrutements',
    description: 'Ouvrir les sessions de recrutement, leurs candidats et leur questionnaire.',
    important: false,
  },
  {
    name: Permissions.RecruitmentManage,
    group: PermissionGroups.Recruitment,
    displayName: 'Gérer les recrutements',
    description: 'Ouvrir une session, tenir sa timeline et déplacer les candidats.',
    important: true,
    parent: Permissions.RecruitmentRead,
  },
  {
    name: Permissions.RecruitmentCandidateWrite,
    group: PermissionGroups.Recruitment,
    displayName: 'Traiter un candidat',
    description: 'Poser un entretien, écrire un bilan et commenter une candidature.',
    important: false,
    parent: Permissions.RecruitmentRead,
  },
  {
    name: Permissions.RecruitmentInstructionWrite,
    group: PermissionGroups.Recruitment,
    displayName: 'Écrire les consignes',
    description: 'Rédiger les consignes de recrutement d’une session.',
    important: true,
    parent: Permissions.RecruitmentRead,
  },
  {
    name: Permissions.IntegrationManage,
    group: PermissionGroups.Recruitment,
    displayName: 'Gérer les liens d’intégration',
    description: 'Émettre et révoquer les liens du formulaire d’intégration.',
    important: true,
    parent: Permissions.RecruitmentRead,
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
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyReviewRead,
    group: PermissionGroups.Academy,
    displayName: 'Lire les bilans vocaux',
    description: 'Ouvrir les traces écrites des bilans tenus avec un junior.',
    important: true,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyReviewWrite,
    group: PermissionGroups.Academy,
    displayName: 'Tenir un bilan vocal',
    description: 'Écrire la trace d’un bilan et fixer les objectifs suivants.',
    important: true,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademySkillWrite,
    group: PermissionGroups.Academy,
    displayName: 'Noter les compétences',
    description: 'Faire évoluer le pourcentage de maîtrise d’une compétence.',
    important: false,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyNoteRead,
    group: PermissionGroups.Academy,
    displayName: 'Lire les notes de FSI',
    description: 'Ouvrir les remarques posées sur le suivi d’un junior.',
    important: true,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyNoteWrite,
    group: PermissionGroups.Academy,
    displayName: 'Écrire une note de FSI',
    description: 'Poser ou retirer une remarque sur le suivi d’un junior.',
    important: true,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyObjectiveWrite,
    group: PermissionGroups.Academy,
    displayName: 'Fixer les objectifs',
    description: 'Créer, modifier et réordonner les objectifs personnels.',
    important: false,
    parent: Permissions.AcademyRead,
  },
  {
    name: Permissions.AcademyReviewValidate,
    group: PermissionGroups.Academy,
    displayName: 'Décider d’un bilan',
    description: 'Valider ou refuser un bilan soumis, ce qui fait avancer la FSI.',
    important: true,
    parent: Permissions.AcademyRead,
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
    name: Permissions.LegacyRead,
    group: PermissionGroups.Legacy,
    displayName: 'Voir les parcours Legacy',
    description: 'Suivre les parcours de formation des futurs Responsables.',
    important: false,
  },
  {
    name: Permissions.LegacyManage,
    group: PermissionGroups.Legacy,
    displayName: 'Piloter les parcours Legacy',
    description: 'Ouvrir un parcours, noter chaque module et suivre la progression.',
    important: true,
    parent: Permissions.LegacyRead,
  },
  {
    name: Permissions.LegacySelf,
    group: PermissionGroups.Legacy,
    displayName: 'Suivre son parcours Legacy',
    description: 'Ouvrir ses modules et répondre à leurs exercices.',
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
    parent: Permissions.TeamRead,
  },
  {
    name: Permissions.ReferenceRead,
    group: PermissionGroups.Configuration,
    displayName: 'Voir la configuration',
    description: 'Consulter divisions, fonctions, YouTubeurs et états.',
    important: false,
  },
  {
    name: Permissions.ReferenceManage,
    group: PermissionGroups.Configuration,
    displayName: 'Gérer la configuration',
    description: 'Créer et modifier les données de référence.',
    important: true,
    parent: Permissions.ReferenceRead,
  },
  {
    name: Permissions.AccessManage,
    group: PermissionGroups.Access,
    displayName: 'Gérer les accès et la console',
    description: 'Attribuer les permissions par rôle et par fonction, ouvrir la console admin.',
    important: true,
  },
]

/**
 * Permission lookup
 * @type {Map<PermissionName, PermissionMeta>}
 */

const PERMISSION_INDEX = new Map(PermissionsList.map((entry) => [entry.name, entry]))

/**
 * Children of a page permission, in catalogue order
 * @type {Map<PermissionName, PermissionName[]>}
 */

export const PERMISSION_CHILDREN: Map<PermissionName, PermissionName[]> = PermissionsList.reduce(
  (map, entry) => {
    if (entry.parent) map.set(entry.parent, [...(map.get(entry.parent) ?? []), entry.name])

    return map
  },
  new Map<PermissionName, PermissionName[]>()
)

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
 * Drop every refinement whose page permission is missing
 * @param {Iterable<PermissionName>} granted - Permissions held
 * @return {PermissionName[]} - Permissions with an inert refinement removed
 */

export const prunePermissions = (granted: Iterable<PermissionName>): PermissionName[] => {
  const held = new Set(granted)

  // A refinement carries no weight without the page it refines
  for (const entry of PermissionsList) {
    if (entry.parent && held.has(entry.name) && !held.has(entry.parent)) held.delete(entry.name)
  }

  return [...held]
}

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
