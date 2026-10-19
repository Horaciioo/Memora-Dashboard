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
    version: '0.6.0',
    date: '2026-10-20',
    title: 'Une Mod View beaucoup plus complète',
    intro:
      'Le chat de la Mod View se rapproche de celui de Twitch : on y répond, on y épingle, on y choisit ses émoticônes et on y règle son affichage.',
    description:
      'Jusqu’ici, modérer un live depuis Memora obligeait à repasser par Twitch pour répondre, épingler ou traiter une demande de débannissement. Cette version ramène ces gestes dans la Mod View, avec des préférences d’affichage et des commandes au clavier.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la possibilité de répondre à un message du chat depuis la Mod View',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LivePin,
        text: 'Ajout de la possibilité d’épingler un message du chat, qui reste affiché en haut jusqu’à ce qu’il soit désépinglé',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout du sélecteur d’« Émoticônes » dans le chat de la Mod View, avec celles de la chaîne et celles de Twitch',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Ajout de commandes tapées dans le chat de la Mod View, listées en tapant « / » : avertir, exclure, bannir, débannir et régler les modes du chat',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Ajout de la possibilité d’avertir un viewer en un clic depuis un message, en indiquant la raison',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveUnbanRequest,
        text: 'Ajout du bureau « Demandes d’annulation de bannissement » dans la Mod View, avec le détail du viewer, ses messages et les commentaires laissés sur lui',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout des « Préférences » du chat : pause au survol ou tant que Alt est maintenue, place des icônes de modération, messages traités gardés ou retirés',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceManage,
        text: 'Ajout de la possibilité pour les Admins de supprimer un créateur avec toutes ses données',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration du chat de la Mod View : les liens sont cliquables, les pseudos gardent leur couleur Twitch et la largeur des colonnes se règle',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Amélioration des durées d’exclusion proposées et des modes « Mode lent » et « Followers uniquement », qui offrent les mêmes choix que Twitch',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de l’onglet du navigateur, qui porte désormais le nom du créateur du live',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de l’affichage des emojis dans tout Memora',
      },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-10-19',
    title: 'Des lives plus fluides',
    intro:
      'La Mod View tient mieux les gros lives, les horaires et les renforts s’organisent, et les chaînes des créateurs se saisissent plus simplement.',
    description:
      'Jusqu’ici, un live très actif pouvait faire ramer la Mod View, les horaires de présence n’étaient pas demandés et déclarer une chaîne obligeait à connaître le bon format de lien. Cette version fluidifie le chat en pleine affluence, ajoute les horaires, les renforts et les commentaires aux lives, et simplifie la saisie des chaînes.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout de la possibilité d’indiquer ses horaires de présence en répondant à l’appel d’un live, puis de les modifier ou de passer en « Je modère dès à présent » jusqu’à une heure choisie',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveAnnounce,
        text: 'Ajout de la possibilité d’appeler des modérateurs en renfort sur un live, qui reçoivent une alerte pour le rejoindre',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveAnnounce,
        text: 'Ajout de la possibilité de changer les Coordinateurs d’un live après son annonce',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la section « Lives passés » dans « Live en cours », avec « Rétablir le live » quand il a été clos avant la fin prévue',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la possibilité de laisser un commentaire sur un viewer depuis sa fiche dans la Mod View',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveTerms,
        text: 'Ajout des « Termes bloqués » dans les modes du chat de la Mod View : un volet s’ouvre sur le côté pour ajouter ou retirer un terme',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une confirmation « Tu t’arrêtes là ? » quand un modérateur quitte la Mod View, pour que son temps de modération reste exact',
      },
      {
        tag: ChangelogTags.Added,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la « Vue simulée » : en vue Junior, Modérateur ou Responsable, Memora affiche les pages et les accès de ce rôle, avec les fonctions du compte, en lecture seule',
      },
      {
        tag: ChangelogTags.Added,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la « Vue Junior » dans le sélecteur de vue, pour voir le parcours d’un Junior',
      },
      {
        tag: ChangelogTags.Improved,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration du sélecteur de vue : Memora s’ouvre désormais sur la vue du rôle de chacun',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Mod View » : le chat reste fluide quand un live s’emballe, et se met en pause le temps de lire un message',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration des modes du chat : le « Mode bouclier » reste aux Administrateurs, le « Chat réservé aux abonnés » s’ouvre aux Responsables et le « Mode lent » aux Modérateurs, les Juniors voyant ces commandes grisées',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveLogRead,
        text: 'Amélioration visuelle du « Bilan » d’un live',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de la file de l’« Accueil » : l’appel d’un live et la demande de Coordinateur s’y répondent directement',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceManage,
        text: 'Amélioration de l’ajout d’une chaîne à un YouTubeur : le logo de la plateforme s’affiche à gauche et seul l’identifiant se saisit, le début du lien étant écrit d’avance',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des champs de date et d’heure des formulaires : les jours impossibles à choisir sont grisés',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de tout Memora : les détails séparés par un point médian le sont désormais par des virgules',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui permettait de se sanctionner soi-même, ou de sanctionner la chaîne, depuis la « Mod View »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui affichait le créateur « Déconnecté(e) » dans la fenêtre du flux alors qu’il était en direct',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceRead,
        text: 'Correction d’un bug qui affichait « Aucune chaîne renseignée » sur la fiche d’un YouTubeur malgré une chaîne ajoutée',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui affichait une heure de plus que celle choisie dans les champs de date et d’heure des formulaires',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveAnnounce,
        text: 'Correction d’un bug qui mélangeait les options d’un évènement classique, comme « Visibilité » et « Membres concernés », avec celles du modèle « Live » à l’annonce d’un live, et qui le proposait à toute l’équipe',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui permettait d’ouvrir la « Mod View » d’un live sans être modérateur de la chaîne du créateur',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui déformait la « Mod View » quand un message du chat très long arrivait au début d’un live',
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-18',
    title: 'Encore et toujours des améliorations',
    intro:
      'La Mod View subit une grande amélioration, les bilans sont mieux comparés et exportés, et les annonces se créent sans projet.',
    description:
      "Jusqu'ici, la Mod View était figée, les bilans du créateur et de l’équipe étaient séparés, et les annonces ne pouvaient pas se créer sans projet. Cette version rend la Mod View plus flexible, améliore drastiquement les bilans et permet de créer des annonces sans projet.",
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de mettre une page en favori depuis l’étoile de sa bannière',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la section « Comptes » dans l’onglet « Sécurité » des « Paramètres » : Discord, Twitch et YouTube y sont réunis, avec « Ajouter une liaison » pour relier un compte et « Délier » pour le retirer',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.preferences,
        text: 'Amélioration de la section « Connexion » des « Paramètres » : elle montre l’ID Memora à la place de l’identifiant Discord',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveAnnounce,
        text: 'Amélioration de l’annonce d’un live : elle se fait désormais depuis le « Calendrier » avec le modèle « Live », et le bouton « Annoncer un live » de « Live en cours » y mène directement',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveAnnounce,
        text: 'Ajout de la plateforme, des Coordinateurs et des consignes au modèle « Live » : toute l’équipe Lives du YouTubeur est convoquée par défaut, et seuls cette équipe (hors Junior), les Responsables du YouTubeur et les Administrateurs sont proposés comme Coordinateurs',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout du chemin de la page ouverte sous sa destination dans le menu de gauche, pour remonter d’un niveau en un clic',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout du mode « Achromatopsie » aux modes de vision des couleurs, qui lit tout Memora en gris',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationWrite,
        text: 'Ajout de la possibilité d’écrire une annonce directement dans « Communications », sans projet, avec un statut : prévue, en cours d’écriture, écrite, publiée ou annulée',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationWrite,
        text: "Ajout de la possibilité de sélectionner simultanément plusieurs évènements dans Projets, Tâches, Communications et Calendrier, pour les supprimer, ou modifier des propriétés d'un seul clic",
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Ajout de filtres par projet, plateforme et statut dans « Communications », avec les annonces publiées et annulées repliées par défaut',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la possibilité de ranger les fenêtres de la « Mod View » en colonnes : glisser-déposer, redimensionnement, repli, plein écran et affichage fenêtre par fenêtre depuis « Paramètres »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une disposition de départ propre à chaque poste de la « Mod View » : Modérateur, Formateur, Responsable et Admin, mémorisée séparément',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de l’onglet « Surveillance » à côté de la file AutoMod, pour suivre des viewers à part',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.SanctionRead,
        text: 'Ajout d’une « Suggestion » dans le « Panel de sanctions » : la commande à copier selon la catégorie AutoMod et le palier suivant',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.SanctionRead,
        text: 'Ajout de l’« Historique des sanctions » sous les infractions du « Panel de sanctions », avec une poignée pour ajuster la place de chaque moitié',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une section « Dossier » dans la fiche d’un viewer : ses paliers de sanction sur les 90 derniers jours, chez ce créateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveFocus,
        text: 'Ajout d’un panneau « Équipe » dans la colonne de gauche de la « Mod View » : un clic sur un modérateur, ou « Entrer en mode Focus » au clic droit, pour le suivre',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la possibilité d’afficher les lives passés depuis le menu « … » de « Live en cours »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        text: 'Ajout de graphes et d’une comparaison aux cinq lives précédents dans le « Bilan » d’un live',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        text: 'Ajout de la courbe d’audience du live dans le « Bilan », relevée toutes les minutes pendant la diffusion',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        text: 'Ajout de la possibilité d’exporter un « Bilan » en CSV, en JSON ou en PDF',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveCreatorReport,
        text: 'Amélioration du « Bilan » du créateur : il s’ouvre depuis la liste des lives passés, sous le nom « Bilan » comme celui de l’équipe, avec les mêmes graphes et exports',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de « Live en cours » : les lives se rangent en deux sections, « En direct » et « À venir »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Mod View » : plus de barre du haut, une colonne d’icônes à gauche avec le retour à l’Accueil et les « Paramètres », et un flux plus grand par défaut',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la fenêtre du flux : un live hors ligne affiche « Déconnecté(e) » avec le nom du créateur',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Amélioration de « Communications » : une annonce se réécrit en place, dans une barre de message Discord, et chaque propriété se modifie sur la carte',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’« Accueil » : les évènements prévus le même jour se regroupent sous un seul libellé',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.preferences,
        text: 'Amélioration des modes de vision des couleurs : chaque aperçu montre le fond du cadre et les couleurs d’état de son mode',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.journal,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.AccessManage,
        text: 'Amélioration du « Journal » : des filtres, une recherche, une pagination et un export CSV, avec l’adresse, la requête et la gravité de chaque entrée',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug sur mobile qui empêchait de bien vivre la conversation de première connexion',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug rare qui empêchait certaines personnes de vivre correctement la visite de bienvenue',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui ne détectait pas correctement les bannissements temporaires',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui empêchait le live de se lancer à la bonne heure',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Correction d’un bug qui empêchait les identifiants prédéfinis d’apparaître dans « Communications »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug qui décalait l’heure des évènements dans les calendriers selon le fuseau horaire',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Correction d’un bug qui laissait les modérateurs ouvrir « Communications » malgré un accès réservé aux Responsables',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        text: 'La « Mod View » reste en cours de construction : dis-nous ce qui te manque ou te gêne dans ta disposition.',
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-10-14',
    title: 'Responsive, Recrutements & Academy débarquent !',
    intro:
      'Tu suis chaque candidat et chaque junior de bout en bout, et tout ce qui se planifie arrive dans le calendrier.',
    description:
      'Jusqu’ici, un entretien se tenait hors de Memora, la timeline de l’Academy était une suite d’étapes à cocher à la main, et les bilans n’apparaissaient nulle part dans le calendrier. Cette version fait vivre le recrutement dans Memora, de l’annonce à l’entretien. Elle repense le suivi de l’Academy autour des moments réels de la promotion et rend les échanges visibles là où ils ont lieu.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une animation d’ouverture : le nom « Memora » se remplit de couleur pendant le chargement, puis la caméra plonge dans le « e » et la page s’ouvre. Un clic permet de la passer',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’une fiche par candidat, avec sa timeline et ses informations',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout de la possibilité de passer l’entretien d’un candidat depuis sa fiche, de le reprendre ou de le revoir',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la possibilité d’observer un entretien, dans la limite d’un quota d’observations par observateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentManage,
        text: 'Ajout de la gestion des « Observateurs » d’une session : ajout, quota et retrait',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout d’exercices pratiques pour les candidats : choix de l’exercice, questions chronométrées et cas à présenter',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout de la possibilité d’envoyer à un candidat des liens de mise en situation, un contexte modéré et un complexe : chaque lien ne s’ouvre qu’avec son compte Discord, se copie, peut expirer et se régénérer',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentManage,
        text: 'Ajout de l’annonce d’une session : texte et image à copier, avec une version générique à restaurer',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceRead,
        text: 'Ajout de la liste des identifiants Discord (membres, rôles, salons, serveur) dans « Configuration », pour que les annonces affichent leur nom',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Ajout d’une timeline de promotion découpée en périodes, qui montre où en est chaque junior et ce qui l’attend',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Ajout de la timeline d’un junior, avec les gestes à faire à chaque moment',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyNoteRead,
        text: 'Ajout d’un fil de commentaires sur chaque session et sur chaque fiche de junior',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyReviewRead,
        text: 'Ajout de fenêtres de bilan : le premier bilan et le bilan final ont chacun leur échéance',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Ajout du lien vers la fiche de recrutement d’un junior, depuis sa fiche',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.AcademyRead,
        text: 'Ajout des entretiens de formateur, des entretiens de panel et des bilans de l’Academy dans le « Calendrier », avec le formateur concerné',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout des entretiens de recrutement dans le « Calendrier »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’une bulle d’informations au-dessus des listes dépliables de questions dans le bilan d’un entretien',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la possibilité de mentionner des personnes dans les commentaires d’un candidat',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.academy,
        permission: Permissions.AcademyNoteRead,
        text: 'Ajout de la possibilité de mentionner des personnes dans les commentaires d’une session ou d’un junior',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité d’ouvrir le menu d’un élément par un appui long sur téléphone',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout, sur téléphone, d’une feuille de filtres et du balayage pour changer de période dans le « Calendrier »',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de colonnes repliables dans les tableaux sur téléphone',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de l’affichage sur téléphone et sur tablette : bannières, grilles, fenêtres, accueil et raccourcis s’adaptent à la taille de l’écran',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la navigation sur téléphone : le menu, la barre du haut et les options de page sont repensés, avec des zones tactiles plus grandes',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de la fiche d’un junior : « Progression », « Objectifs », « Compétences », « Notes » et « Bilans » sont rangés en onglets',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de la fiche d’une session : « Juniors », « Calendrier » et « Lexique » vivent dans la session, la page « Lexique » à part disparaît',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.AcademyManage,
        text: 'Amélioration du lancement d’une session : un message prévient quand le recrutement rattaché est encore en cours',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des listes « Academy » et « Recrutements » : des lignes simples remplacent les cartes',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des champs de date : une journée entière se choisit sans heure, et l’heure par défaut se pré-remplit',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des champs de pourcentage : un curseur et une saisie directe',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui faisait planter la page « Recrutements » à l’ouverture de la liste',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui privait les Recruteurs de leurs accès initiaux',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Correction d’un bug qui privait les Formateurs de leurs accès initiaux',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.sanctions,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.SanctionManage,
        text: 'Correction d’un bug qui empêchait d’appliquer tous les types de sanctions prévues',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug qui empêchait l’horaire d’apparaître dans les calendriers',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui empêchait la mention dans un commentaire d’afficher la bulle de notification',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        permission: Permissions.AcademyNoteRead,
        text: 'Correction d’un bug qui empêchait la mention dans un commentaire d’afficher la bulle de notification',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui empêchait les liens d’exercices de s’afficher correctement',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.AcademyManage,
        text: 'Correction d’un bug qui empêchait de lancer la PIM, malgré le rôle',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui cachait la vue des « questions secondaires »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui permettait à quiconque de modifier les informations d’un candidat',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug qui empêchait la liste des questions réussies, échouées et neutres d’apparaître correctement',
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2026-10-12',
    title: 'Memora se range',
    intro:
      'Le menu et le haut de chaque page se simplifient, et les gestes du quotidien se font plus près de là où on les cherche.',
    description:
      'Jusqu’ici, le menu mélangeait Twitch et Discord, le titre des pages laissait peu de place à la photo, et certains gestes simples comme renommer un modérateur, corriger une absence ou copier un identifiant demandaient un détour. Cette version sépare clairement les deux plateformes, donne sa place à chaque page et corrige plusieurs plantages et affichages erronés.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout de la possibilité de passer, dans le menu latéral du « Calendrier », entre le mini-calendrier et le menu habituel',
      },
      {
        tag: ChangelogTags.Added,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’un sélecteur de vue en trois couleurs, bleu modérateur, orange responsable et rouge admin, dans le menu latéral',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité de corriger une absence depuis la fiche d’un modérateur tant qu’elle n’est pas terminée',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité de renommer un modérateur en cliquant sur son pseudo, sur sa fiche',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TaskManage,
        text: 'Ajout de la possibilité de valider une tâche depuis la fiche d’un projet',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la possibilité de modifier son pseudo dans « Paramètres »',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de copier un identifiant Discord d’un clic',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la bannière Discord de ton compte, reprise à chaque connexion',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle du haut de chaque page : le titre se pose sur la photo, avec une courte phrase en dessous',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu latéral : « Modération » devient « Twitch », et Discord a son propre groupe',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la rapidité : une page ne se charge qu’au moment où tu t’apprêtes à l’ouvrir',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration du mini-calendrier : de simples flèches changent de mois, et un clic sur un jour ouvre ce dernier',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des listes de choix : une entrée « Aucun » en tête permet de tout désélectionner, et les choix s’ouvrent dès que tu modifies un champ',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.marsha,
        text: 'Amélioration de l’exemple de commande de « Marsha Bots » : il s’affiche à ton nom et avec ta photo',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la fiche et de la carte d’un modérateur : sa photo et le glyphe de son rôle remplacent le logo de division',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.changelog,
        text: 'Amélioration de la page « Nouveautés » : le bandeau annonce la version que tu utilises',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Correction d’un bug qui affichait « page introuvable » à la place de la vraie erreur quand la fiche d’un modérateur ne s’ouvrait pas',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui laissait la « Recherche » proposer des modérateurs que tu n’as pas le droit d’ouvrir, toi-même compris',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui menait certains résultats de la « Recherche » vers une page qui t’était interdite',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui te renvoyait à l’accueil, ou sur « page introuvable », quand tu n’avais pas accès à une page : une page « Accès refusé » s’affiche à la place',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui renvoyait vers une mauvaise adresse après certaines actions de connexion',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui faisait bouger la page quand on modifiait un champ en place',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui n’affichait pas les bons fuseaux horaires',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        text: 'Correction d’un bug qui n’affichait pas le bon temps de départ dans la page « Live en cours »',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug rare qui faisait planter Memora à cause d’une redirection vers une mauvaise version de l’application',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        text: 'Correction d’un bug qui empêchait le live de se lancer quand son horaire tombait en même temps qu’un autre évènement',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.members,
        text: 'Correction d’un bug qui faisait planter Memora en ouvrant sa propre fiche',
      },
    ],
  },
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
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de signaler en fin de visite ce qui pourrait freiner sa modération, avec des exemples ou en restant discret, la réponse rejoignant la fiche du modérateur sous une note « SYSTÈME »',
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
