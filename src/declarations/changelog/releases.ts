import { ROUTES } from '@/declarations/navigation'
import type { Tone } from '@/declarations/ui/theme'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Note categories
export const ChangelogTags = {
  Added: 'nouveau',
  Improved: 'ameliore',
  Fixed: 'corrige',
} as const

/**
 * Note category
 * @type {(typeof ChangelogTags)[keyof typeof ChangelogTags]}
 */

export type ChangelogTag = (typeof ChangelogTags)[keyof typeof ChangelogTags]

/**
 * Category display
 * @typedef {Object} ChangelogTagMeta
 * @property {string} heading - Section title
 * @property {Tone} tone - Dot colour
 * @property {IconName} icon - Section glyph
 */

export interface ChangelogTagMeta {
  heading: string
  tone: Tone
  icon: IconName
}

/**
 * Categories in reading order
 * @type {Record<ChangelogTag, ChangelogTagMeta>}
 */

export const CHANGELOG_TAGS: Record<ChangelogTag, ChangelogTagMeta> = {
  [ChangelogTags.Added]: { heading: 'Nouveautés', tone: 'brand', icon: 'add' },
  [ChangelogTags.Improved]: { heading: 'Améliorations', tone: 'info', icon: 'refresh' },
  [ChangelogTags.Fixed]: { heading: 'Corrections de bugs', tone: 'success', icon: 'confirm' },
}

/**
 * Any static page
 * @type {string}
 */

export type ChangelogPage = Extract<(typeof ROUTES)[keyof typeof ROUTES], string>

/**
 * One change line
 * @typedef {Object} ChangelogItem
 * @property {ChangelogTag} tag - Category
 * @property {string} text - Reader sentence
 * @property {ChangelogPage} [page] - Concerned page
 * @property {PermissionName} [permission] - Required to read
 */

export interface ChangelogItem {
  tag: ChangelogTag
  text: string
  page?: ChangelogPage
  permission?: PermissionName
}

/**
 * Team word on a category
 * @typedef {Object} ChangelogComment
 * @property {ChangelogTag} tag - Category
 * @property {ChangelogPage} [page] - Concerned page
 * @property {string} text - Word
 * @property {PermissionName} [permission] - Required to read
 */

export interface ChangelogComment {
  tag: ChangelogTag
  page?: ChangelogPage
  text: string
  permission?: PermissionName
}

/**
 * One release note
 * @typedef {Object} ChangelogRelease
 * @property {string} version - X.Y.Z
 * @property {string} date - YYYY-MM-DD
 * @property {string} title - Note title
 * @property {string} intro - Reader summary
 * @property {string} description - Why the changes were made
 * @property {ChangelogItem[]} items - Change lines
 * @property {ChangelogComment[]} [comments] - Team words
 */

export interface ChangelogRelease {
  version: string
  date: string
  title: string
  intro: string
  description: string
  items: ChangelogItem[]
  comments?: ChangelogComment[]
}

/**
 * Release notes
 * @type {ChangelogRelease[]}
 */

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '0.2.0',
    date: '2026-10-08',
    title: 'Un calendrier plus clair',
    intro:
      'Le calendrier met enfin la présence au centre, et les équipes de responsables voient mieux ce qui les concerne.',
    description:
      'Le détail d’un évènement mélangeait toutes les informations et chacun ne savait pas quoi y faire. Cette version sépare la réponse de chaque convoqué de l’Appel de présence réservé aux responsables, et rend aux absences leurs réponses, jusque-là invisibles pour les membres.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.dashboard,
        text: 'Ajout de raccourcis sur l’accueil adaptés au métier de chaque modérateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout de la possibilité, pour chaque convoqué, de dire s’il sera présent ou absent depuis le détail d’un évènement',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Ajout de la possibilité de relancer les sans-réponse de l’« Appel de présence » en leur envoyant une notification',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        text: 'Ajout de la réponse du responsable sous chaque absence, désormais visible par le membre concerné',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        text: 'Ajout de l’identifiant Memora de chaque modérateur sous son identifiant Discord',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration visuelle du détail d’un évènement dans la page « Calendrier » : date en tête, description dans une box, boutons avec du texte',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Amélioration de l’« Appel de présence », qui s’ouvre et se ferme en douceur, réservé aux responsables et au-delà',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la page « Modérateurs » : la mention « En absence » se lit à côté du pseudo, sans agrandir la carte',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de l’annonce d’une nouvelle version, désormais en or et placée sous le raccourci « Nouveautés » en haut de la barre latérale',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        permission: Permissions.ProjectDelete,
        text: 'Amélioration des droits des responsables : ils peuvent désormais supprimer les « Projets », « Tâches » et « Réunions »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.trainings,
        text: 'Amélioration de la page « Formations » : la visite de Memora y apparaît et les formations pas encore ouvertes sont signalées comme indisponibles',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la fin de la visite de Memora, qui se termine par une petite célébration',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        permission: Permissions.ProjectRead,
        text: 'Amélioration des droits des modérateurs : ils consultent leurs « Tâches » sans pouvoir les modifier, et les pages « Formations » et « Recrutement » restent aux formateurs et recruteurs',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        permission: Permissions.MeetingUpdate,
        text: 'Correction d’un bug qui empêchait de modifier l’état, la date et l’heure d’une réunion depuis la box « Informations »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        text: 'Correction d’un bug qui permettait à un modérateur d’ouvrir la fiche d’un autre membre',
      },
    ],
  },
  {
    version: '0.1.1',
    date: '2026-10-08',
    title: 'Tes retours, déjà pris en compte',
    intro:
      'Les premiers testeurs ont parlé : des pages plus fluides, des accès mieux répartis et plusieurs bugs en moins.',
    description:
      'Les premiers essais ont montré des pages qui saccadaient, des accès trop larges pour les modérateurs et quelques fonctions qui ne répondaient pas. Cette version corrige tout ça : les pages se mettent à jour d’elles-mêmes, et chacun ne voit que ce qui le concerne.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de voir les informations se mettre à jour toutes seules, sans recharger la page',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        permission: Permissions.ProjectRead,
        text: 'Ajout de la possibilité, pour les modérateurs, de consulter les « Projets », « Tâches » et « Réunions » dans lesquels ils sont cités',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        permission: Permissions.CommunicationWrite,
        text: 'Ajout de la possibilité de rédiger une communication dans un projet dont on fait partie',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        permission: Permissions.TaskCreate,
        text: 'Ajout de la possibilité de créer une tâche dans un projet dont on fait partie',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la fluidité de toutes les pages, surtout celles qui affichent de longues listes',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.dashboard,
        text: 'Amélioration visuelle de la page « Accueil » : elle reste dans le cadre sur les écrans d’ordinateur portable',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des bulles de notification : elles restent plus longtemps à l’écran et ne se ferment plus tant que la souris est dessus',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.tasks,
        permission: Permissions.TaskUpdate,
        text: 'Amélioration des « Tâches » : le responsable, l’état et la deadline ne se changent plus que par les Responsables',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        text: 'Amélioration de la confidentialité des lives : leurs logs ne sont plus visibles que par les Responsables du créateur concerné',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        text: 'Amélioration de la confidentialité de la page « Modérateurs » : les fiches sont réservées aux Responsables, pour les créateurs dont ils s’occupent',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la recherche : elle ne montre plus que ce que chacun a le droit de consulter',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.absences,
        permission: Permissions.AbsenceReview,
        text: 'Correction d’un bug qui empêchait les Responsables de voir les absences posées par les modérateurs de leurs créateurs',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        permission: Permissions.MeetingUpdate,
        text: 'Correction d’un bug qui empêchait d’ajouter un sujet à une réunion sans avoir choisi d’émoji',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Improved,
        text: 'Merci aux testeurs : chacun de ces points vient d’un retour reçu cette semaine.',
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-03',
    title: 'Memora ouvre ses portes',
    intro:
      'Le premier Memora : l’équipe, les projets, le calendrier, la modération et la formation réunis au même endroit.',
    description:
      'Marsha réunit des équipes de modération réparties sur plusieurs créateurs. Planning, absences, formation et sanctions vivaient jusqu’ici dans des outils séparés. Cette première version les rassemble : chaque membre sait ce qu’on attend de lui, et les Responsables voient où en est chaque créateur.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.dashboard,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Accueil » qui rassemble ce qui attend chaque membre aujourd’hui',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout d’un « Calendrier » partagé avec l’appel de présence de chaque réunion',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        text: 'Ajout de la possibilité de déclarer une absence en quelques clics, validée ensuite par l’Administration',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        permission: Permissions.ProjectRead,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Projets » : projets, tâches et réunions suivis sur des tableaux, créateur par créateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Marsha Academy » : sessions, étapes et suivi de chaque Junior',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Panel de sanctions » : des sanctions graduées avec le journal de chaque mesure',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la possibilité de sécuriser son compte avec une connexion en deux étapes, de choisir son thème et la taille du texte, et d’exporter ses données',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.dashboard,
        text: 'On a voulu que tu ouvres Memora et que tout ce qui t’attend soit déjà là.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        text: 'Prévenir d’une absence ne doit pas demander plus d’une minute.',
      },
    ],
  },
]
