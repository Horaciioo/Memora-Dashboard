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
