import { ROUTES } from '@/declarations/navigation'
import type { Tone } from '@/declarations/ui/theme'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

// Note readers
export const ChangelogAudiences = {
  Responsables: 'responsables',
} as const

/**
 * Restricted readers
 * @type {(typeof ChangelogAudiences)[keyof typeof ChangelogAudiences]}
 */

export type ChangelogAudience = (typeof ChangelogAudiences)[keyof typeof ChangelogAudiences]

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
 * @property {ChangelogAudience} [audience] - Reserved readers, all when empty
 * @property {PermissionName} [permission] - Required to read
 */

export interface ChangelogItem {
  tag: ChangelogTag
  text: string
  page?: ChangelogPage
  audience?: ChangelogAudience
  permission?: PermissionName
}

/**
 * Team word on a category
 * @typedef {Object} ChangelogComment
 * @property {ChangelogTag} tag - Category
 * @property {ChangelogPage} [page] - Concerned page
 * @property {string} text - Word
 * @property {ChangelogAudience} [audience] - Reserved readers, all when empty
 * @property {PermissionName} [permission] - Required to read
 */

export interface ChangelogComment {
  tag: ChangelogTag
  page?: ChangelogPage
  text: string
  audience?: ChangelogAudience
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
    version: '0.3.0',
    date: '2026-10-11',
    title: 'Memora s’améliore !',
    intro:
      'Les responsables gèrent désormais un départ, un gel d’accès ou une suspension depuis la fiche d’un modérateur, et chacun voit plus vite ce qui est en retard.',
    description:
      'Jusqu’ici, les gestes lourds sur un modérateur se faisaient hors de Memora, et un projet, une tâche ou une réunion ne pouvait concerner qu’un seul créateur. Cette version regroupe ces gestes dans la fiche du modérateur, permet de rattacher plusieurs créateurs et plusieurs chaînes, et signale les éléments en retard avant qu’ils ne passent inaperçus.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout d’un onglet « Admin » dans la fiche d’un modérateur, qui réunit les gestes lourds au même endroit',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité de geler et de dégeler l’accès d’un modérateur sans toucher à sa fiche',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité d’enregistrer le départ d’un modérateur, par dérank ou par démission, avec un message de départ prêt à copier pour Discord',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité de suspendre un modérateur des lives, pour une durée choisie ou définitivement, puis de lever la suspension',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberDelete,
        text: 'Ajout de la possibilité de supprimer la fiche d’un modérateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout de la possibilité de réserver un évènement du « Calendrier » à une équipe, ou aux seuls responsables de cette équipe',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TeamRead,
        text: 'Ajout de la possibilité d’associer plusieurs chaînes à un créateur, y compris plusieurs sur la même plateforme',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        text: 'Ajout de la possibilité de rattacher plusieurs créateurs, ou aucun, à un projet, une tâche ou une réunion',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        text: 'Ajout d’une marque rouge « hors deadline » sur tout projet, toute tâche ou toute réunion dont la date limite est dépassée',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une bulle à côté de « Projets », « Tâches » ou « Réunions » dans la barre latérale quand un de tes éléments est en retard',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de retrouver tes dernières recherches en ouvrant la recherche',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de l’identifiant de chaque projet, tâche, réunion et créateur sur sa fiche, copiable d’un clic',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la fiche d’un modérateur : l’état de son accès, ses sanctions et sa suspension en cours se lisent d’un coup d’œil',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberDelete,
        text: 'Amélioration de la suppression d’un modérateur : il n’est plus possible de se supprimer soi-même ni de supprimer un rang supérieur',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la vue d’un modérateur sur les lives : temps en Mod View, temps actif et lives rejoints sur les derniers jours sont réunis dans une même box',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la protection des données : l’adresse mail et le numéro de téléphone ne sont plus demandés ni affichés sur les fiches',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la confidentialité de la recherche : les dernières recherches sont propres à chaque compte',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration de la réponse à un évènement du « Calendrier » : une fois répondu, un message le confirme et un bouton « Je change d’avis » permet de modifier',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Amélioration de la visibilité d’un évènement du « Calendrier » : « Responsables et plus » devient « Administration entière », avec un glyphe par niveau',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TeamRead,
        text: 'Amélioration de la page d’un créateur : la section « Responsables ancrés » devient « Administration » et accueille aussi les administrateurs',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        text: 'Amélioration visuelle de la fiche d’un projet : description dans une box, propriétés sur une colonne et contenu sur l’autre',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        text: 'Amélioration de la fiche d’une tâche et d’un projet : la description se rédige directement en cliquant dessus',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        text: 'Amélioration de la fiche d’une infraction, désormais sur deux colonnes : gravité et livecon à gauche, commandes et raison suggérée à droite',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.absences,
        text: 'Amélioration visuelle de la raison d’une absence, lisible dans une petite box en italique',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.journal,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration du « Journal » : une action longue ouvre son détail champ par champ via « Voir le détail », et les erreurs rencontrées y figurent aussi',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des calendriers de date : un clic sur le mois ouvre le choix du mois et de l’année, et l’anniversaire s’ouvre sur une année de naissance réaliste',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.trainings,
        text: 'Amélioration du catalogue « Formations » : le rôle concerné s’affiche par un glyphe et la mention « Nouveau » disparaît',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration des étapes du « Recrutement » : le rôle concerné se repère par un glyphe',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        text: 'Amélioration de la fiche d’un modérateur : les drapeaux des langues parlées s’affichent à côté de leur nom',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.meetings,
        text: 'Amélioration des droits sur les réunions : le contenu rédigé (introduction, sujets, compte rendu) n’est lu que par ceux qui y ont droit',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la visite de Memora : l’accueil devient une vraie discussion avec Memora, à côté de la photo du créateur de l’équipe',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la visite de Memora : l’accueil se déroule en trois étapes, avec les préférences, les réseaux sociaux et le daltonisme demandés au fil de la discussion',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la visite de Memora : une courte pause avant chaque nouvelle étape de la discussion',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug qui empêchait la bulle du jour dans le mini-calendrier de s’afficher correctement',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug qui empêchait les rails de sélection du « Calendrier » d’afficher uniquement les informations du YouTubeur sélectionné',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Correction d’un bug qui empêchait de supprimer un identifiant placé par erreur sur la mauvaise personne',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberDelete,
        text: 'Correction d’un bug qui empêchait de supprimer un modérateur',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui laissait un modérateur dont l’accès avait été coupé ouvrir une nouvelle session',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.journal,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug qui rendait certaines phrases du « Journal » ambiguës quand elles concernaient un sujet de réunion',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui faisait réapparaître le formulaire d’informations dès qu’on réaffichait les explications',
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-08',
    title: 'Un calendrier plus clair',
    intro:
      'Le calendrier met enfin la présence au centre, et les équipes de responsables voient mieux ce qui les concerne.',
    description:
      'Le détail d’un évènement mélangeait toutes les informations et chacun ne savait pas quoi y faire. Cette version sépare la réponse de chaque convoqué de l’Appel de présence réservé aux responsables, rend aux absences leurs réponses, jusque-là invisibles pour les membres, et accueille chaque nouvel arrivant avec une visite guidée au lieu de le laisser seul devant l’application.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Visite de Memora », réservée aux nouveaux arrivants : à la première connexion, Memora se présente dans une conversation, enregistre sur le compte l’anniversaire, les langues, les réseaux et l’affichage choisis, puis fait découvrir les pages une à une',
      },
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
        audience: ChangelogAudiences.Responsables,
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
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de l’identifiant Memora de chaque modérateur sous son identifiant Discord',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout des « Actions de départ » sur la fiche d’un modérateur : dérank ou démission, avec un message de départ prêt à copier pour Discord',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout des « Actions sur Memora » sur la fiche d’un modérateur : geler ou rétablir son accès, le suspendre des lives jusqu’à une date, ou supprimer sa fiche',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        text: 'Ajout de la possibilité d’associer plusieurs « YouTubeurs » à un projet, une tâche ou une réunion',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        text: 'Ajout de la mention « hors deadline » sur les projets, tâches et réunions en retard, avec une alerte dans la barre latérale',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout de la possibilité de réserver un évènement à une équipe, ou aux seuls responsables de cette équipe',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TeamRead,
        text: 'Ajout de plusieurs chaînes Twitch ou YouTube par créateur, et d’une « Administration » qui regroupe les responsables de chaque créateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TeamRead,
        text: 'Ajout de la possibilité d’avoir plusieurs responsables par équipe',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout des drapeaux à côté des langues et des recherches récentes dans la recherche rapide',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration visuelle du détail d’un évènement dans la page « Calendrier » : date en tête, description dans une box, boutons avec du texte',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Amélioration de l’« Appel de présence », qui s’ouvre et se ferme en douceur, réservé aux responsables et au-delà',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
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
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ProjectDelete,
        text: 'Amélioration des droits des responsables : ils peuvent désormais supprimer les « Projets », « Tâches » et « Réunions »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.trainings,
        text: 'Amélioration de la page « Formations » : les formations pas encore ouvertes sont signalées comme indisponibles',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        permission: Permissions.ProjectRead,
        text: 'Amélioration des droits des modérateurs : ils consultent leurs « Tâches » sans pouvoir les modifier, et les pages « Formations » et « Recrutement » restent aux formateurs et recruteurs',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la fiche d’un modérateur : les boxes « Place dans l’équipe » et « Ancienneté et langues », sans l’e-mail ni le téléphone',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.legacy,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LegacyRead,
        text: 'Amélioration des droits sur la page « Legacy » : elle reste réservée aux responsables, les modérateurs n’ont plus de page « Mon Legacy »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MeetingUpdate,
        text: 'Correction d’un bug qui empêchait de modifier l’état, la date et l’heure d’une réunion depuis la box « Informations »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
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
        audience: ChangelogAudiences.Responsables,
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
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.AbsenceReview,
        text: 'Correction d’un bug qui empêchait les Responsables de voir les absences posées par les modérateurs de leurs créateurs',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        audience: ChangelogAudiences.Responsables,
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
        audience: ChangelogAudiences.Responsables,
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
