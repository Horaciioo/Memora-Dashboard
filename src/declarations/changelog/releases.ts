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
    version: '0.12.0',
    date: '2026-11-11',
    title: 'Un max. d’améliorations',
    intro:
      'Les Lives, la Mod. View et le chat interne gagnent en confort, et l’encadrement dispose enfin d’un espace « Gestions » pour suivre toute l’équipe au même endroit.',
    description:
      'Suivre l’équipe obligeait à ouvrir plusieurs pages, et le Live comme la Mod. View manquaient de repères pour arriver, discuter et surveiller le chat. Cette version rassemble le suivi de l’équipe dans « Gestions », refait l’arrivée sur un Live en trois étapes, ajoute des salons et des réactions au chat interne, des mots de surveillance personnels ou partagés, et permet de dérank plusieurs modérateurs d’un coup.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Gestions » : un menu du rail qui se déplie sur les Absences, les Réseaux, les Notes, les Anniversaires, les Arrivées et les Fonctions de toute l’équipe.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.AbsenceReview,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Absences » dans « Gestions » : les demandes de l’équipe rangées en À traiter, En cours et à venir, Terminées, Refusées et annulées, avec une recherche par membre ou motif et un filtre par statut.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Réseaux » dans « Gestions » : tous les profils déclarés par les membres, filtrables par réseau, avec un bouton pour ouvrir chaque profil.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberNoteRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Notes » dans « Gestions » : les remarques posées sur les fiches des membres, avec les épinglées en premier et un filtre par auteur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Anniversaires » dans « Gestions » : les dates à souhaiter ce mois-ci, le mois prochain et plus tard dans l’année, avec le nombre de jours restants.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Arrivées » dans « Gestions » : qui est arrivé et depuis quand, avec les nouveaux, les moins d’un an et les plus d’un an, filtrables par rôle et par statut.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une page « Fonctions » dans « Gestions » : qui porte quelle fonction dans l’équipe.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.MemberUpdate,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de dérank plusieurs modérateurs d’un coup avec « Dérank » : leur accès est coupé, ce qu’ils avaient renseigné est effacé, et l’annonce de départ est préparée avec la période d’intégration non validée.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.AcademyManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de réunir plusieurs annonces de départ en un seul message avec « Réunir ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveSharedWords,
        text: 'Ajout des « Mots partagés » dans la Mod. View : un mot de surveillance ajouté pour un créateur est vu par toute l’équipe sur le live, sans rien sanctionner.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de mots de surveillance personnels dans les réglages de la Mod. View : des mots de répétition et des mots interdits qui s’allument dans ton chat, avec une couleur propre à chacun.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de trois salons dans le chat interne du live, « Tous », « Référents » et « Responsables » : les deux derniers ne sont vus que par ceux à qui ils sont réservés.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de réactions en emoji sur les messages du chat interne, d’une mention « @Admin » et d’une ligne « est en train d’écrire » qui montre qui rédige.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’un parcours en trois étapes pour entrer sur un live, « Consignes », « Équipe prévue » puis « Présence », avec un choix « Je ne suis pas disponible » et la possibilité de modifier ta réponse.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’un « Historique des Lives » sur la page « Lives », avec « Tes chiffres » et « Toute l’équipe » : sanctions effectuées, messages envoyés, temps de modération et modérateurs actifs.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.modView,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une page « Mod. View » : elle ouvre le live en cours, ou montre l’outil en lecture seule quand aucun live n’est ouvert, et un bouton flottant « Ouvrir la Mod. View » la rejoint depuis les Lives.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un écran de chargement dans « Memora Play » : le logo Memora et une barre de progression s’affichent pour tous les joueurs dès que l’hôte clique sur « Lancer la partie », puis à l’ouverture d’une partie.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la page « Live en cours », renommée « Lives » : elle montre le prochain live, l’historique et un message plus clair quand rien n’est annoncé.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de l’appel de présence : l’écran sépare Présence, Absences et Non répondu, et les boutons de bilan deviennent « Bilan Mod. » et « Bilan Créa. ».',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu : « Pages privées » devient une entrée du rail avec un lien « Retour au menu », à la place du choix Privées ou Normales, et « Play » rejoint les accès rapides.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des onglets de page : quand tu reviens sur une page, elle rouvre l’onglet que tu avais quitté, et le fil d’Ariane affiche son nom.',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.management,
        audience: ChangelogAudiences.Responsables,
        text: 'Toute l’équipe se suit désormais dans « Gestions », sans passer d’une page à l’autre.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        text: 'Le chat interne et l’arrivée sur un live ont été pensés pour que chacun sache qui est là et à qui il parle.',
      },
    ],
  },
  {
    version: '0.11.1',
    date: '2026-11-09',
    title: 'Memora Play sur son 31',
    intro:
      'Memora Play passe à la vitesse supérieure : des bots pour compléter les tables, des groupes, neuf nouvelles maps de Golf, et une chasse aux bugs sans précédent, avec 54 corrections dans cette version.',
    description:
      'Les parties de Memora Play manquaient de joueurs à certaines heures, se perdaient dans des tables oubliées et cachaient plusieurs défauts de jeu, du Golf au Ludo en passant par la Bombe et le Baccalauréat. Cette version ajoute les bots, les parties privées, les groupes, l’historique et la carrière de chaque joueur, refait les maps du Golf et corrige un nombre record de bugs, autant dans le jeu que dans l’Academy, le Recrutement et le Panel de sanctions. Les Formateurs deviennent des Référents partout, et chaque candidat accepté confirme désormais son identité Discord avant d’entrer.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de bots dans « Memora Play » : « Ajouter un bot » ou « Compléter la table » remplit une partie en Facile, Moyen ou Difficile (un seul niveau au Ludo), et un bot ne gagne ni ne rapporte jamais d’XP.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de créer une partie privée dans « Memora Play » : elle ne figure dans aucune liste, se rejoint avec son code ou sur invitation, et reste fermée aux autres.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Groupes » dans « Memora Play » : on crée un groupe, on y invite des membres, on discute dans un chat de groupe, on lui propose des jeux et on ouvre une partie pour tout le groupe d’un clic.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un « Historique » dans « Memora Play » : les parties terminées, filtrables par jeu, avec les adversaires, le classement final et un chiffre marquant du jeu.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une page « Carrière » dans les statistiques de « Memora Play » : maîtrise de chaque jeu, rangs, taux de victoire et décompte des victoires, nuls et défaites.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de nouvelles pages « Salon », « Feed » et « Classement » dans « Memora Play » : qui est en partie, les dernières parties et les invitations, et le classement de chaque jeu.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une barre d’onglets propre à « Memora Play » sur téléphone, et d’une barre de discussion collée en bas de chaque partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de confirmer qu’on est prêt avant une partie, de la lancer quand même sans les retardataires, et de proposer ou d’accepter une revanche à la fin.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de neuf nouvelles maps dans le « Golf » : RandomTown, SpeedTown, BoingTown, ZigZag, SingleTown, SlideTown, ZarbLand, DroppinHit et Candy Kingdom, qui remplacent les cinq anciens parcours.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout du par de chaque trou dans le « Golf » : le score s’affiche contre le par (Trou en un, Albatros, Eagle, Birdie, Bogey…), avec des mots qui flottent au-dessus du trou.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une colonne des pouvoirs en cours dans le « Golf » : elle montre qui les a lancés, sur quoi ils agissent et à quel moment.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout, pour les spectateurs du « Golf », de la possibilité de suivre un joueur, de passer au joueur précédent ou suivant, ou de voler librement au-dessus du parcours.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’un vol libre au-dessus de toutes les maps du « Golf » depuis le jeu, avec les boîtes de collision et le point du sol regardé, pour vérifier un parcours.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.IntegrationManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité d’activer d’un clic les comptes de tous les candidats acceptés d’un recrutement, avec le suivi de ceux qui ont confirmé leur identité.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une vérification d’identité Discord avant toute connexion : Memora présente à chaque candidat accepté le compte trouvé, lui demande de confirmer, puis l’accueille dans sa session avec une animation.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.IntegrationManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une alerte de Memora, en rouge, quand un candidat ne retrouve pas son compte : le Responsable saisit le bon identifiant Discord, vérifie qui se cache derrière et copie un nouveau lien à lui envoyer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Chat interne » dans la « Vue Modérateur » : l’équipe du live s’écrit sans quitter la vue, avec des mentions (Tout le monde, Équipe Twitch, Coordinateur, Responsables, Référent) et une alerte quand on t’appelle.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout des photos de profil des viewers devant leurs messages dans le chat de la « Vue Modérateur ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout du délai du stream Twitch à côté des minuteurs de la « Vue Modérateur », pour savoir de combien de secondes tu as de retard sur le direct.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout des réglages de la « Vue Modérateur » enregistrés sur ton compte : ils te suivent d’un appareil à l’autre.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une refonte de la fiche d’un viewer dans la « Vue Modérateur » : quatre onglets (Situations, Notes, Messages, Sanctions), le nombre de messages envoyés, le total des sanctions et la possibilité d’écrire une note.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de l’historique des messages d’un viewer dans sa fiche : ses messages sont gardés d’un live à l’autre, avec un bouton « Messages plus anciens » pour remonter le temps.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout de la photo de profil et de la bannière de chaîne du viewer en haut de sa fiche, à la place du logo Twitch.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout, dans le volet des paliers de sanctions de la « Vue Modérateur », d’un champ où taper le pseudo d’un viewer : un clic sur un palier écrit sa commande dans la zone de saisie et la copie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LivePoll,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Sondage » dans la « Vue Modérateur » : on pose une question au chat avec deux à cinq choix, une durée et des votes en plus avec les points de chaîne, puis les résultats s’affichent au-dessus du chat, se plient et se terminent d’un clic.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Mes actions » dans la « Vue Modérateur » : tu composes ta barre de sanctions, avec la durée, la raison, l’icône et la couleur de chaque bouton, tu les glisses pour les ranger, tu vois un aperçu et tu peux tout rétablir par défaut.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout, dans les préférences de la « Vue Modérateur », d’une demande de confirmation avant un ban ou une longue exclusion, d’un choix pour masquer les bots, de la taille du texte, de l’espacement des messages et de deux nouveaux emplacements pour les outils du chat (à droite et sur la carte).',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’un résumé personnel en haut de la page « Live » : tes infractions traitées, ton temps passé à modérer, tes messages et tes lives modérés sur les 30 derniers jours, comparés aux 30 précédents, avec la liste de tes derniers lives.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout d’une alerte dans la barre latérale quand un live démarre, avec un bouton pour la masquer, et la boîte « Live » de la barre latérale passe au rouge pendant le direct.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une roue de couleurs dans les sélecteurs de couleur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de notifications sur téléphone pour « Memora Play » : une invitation à une partie ou à un groupe, et le début d’une partie que tu suis, arrivent dans tes notifications, avec une catégorie « Jeux » à régler dans les paramètres.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de l’accueil de « Memora Play » : une grille des jeux avec leurs logos et leurs bannières, un jeu mystère qui complète la dernière rangée, et un bouton qui ouvre directement une nouvelle table.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Golf » : les pouvoirs deviennent des cartes arc-en-ciel qui se balancent, les ventilateurs se dressent sur un pied, la flèche de visée devient une ligne de carrés et les bumpers montrent leur propriétaire.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Golf » : après le dernier coup d’un trou, les balles s’envolent ensemble vers le départ suivant, avec des bruitages de chute, de fanfare et de cartes distribuées au vote de tournoi.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Ludo » : un plateau aux cases arrondies, un médaillon central, des pions numérotés qui s’empilent à la maison, un cadre qui s’allume à ton tour et de nouveaux sons de dé.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de la « Bombe » : la mèche tremble de plus en plus avant l’explosion, et on peut changer son vote du « Baccalauréat » jusqu’au décompte, avec le choix en surbrillance.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de « Academy » : les Formateurs deviennent des Référents partout, dans les pages, les droits, les notifications, le « Calendrier » et l’« Assistant Memora ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration de « Academy » : une promotion se lance d’elle-même dès que chaque Junior confirmé a son Référent, la déclaration du début de la PIM disparaît.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyReviewWrite,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration de « Academy » : l’onglet « Juniors » d’une session liste les candidats acceptés dont le compte n’est pas encore activé, sous « En attente d’activation ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration du « Panel de sanctions » : chaque métier ouvre son propre panel, Lives pour les équipes Lives, Discord pour les équipes Discord.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de toutes les adresses de Memora : les pages et les réglages ont des adresses en anglais, et les anciens liens redirigent vers les nouveaux.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.changelog,
        text: 'Amélioration de la page « Nouveautés » : la présentation animée disparaît, chaque note s’ouvre directement sur son contenu.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la fenêtre qui s’ouvre quand tu quittes la « Vue Modérateur » : trois choix côte à côte (« Rester sur la vue », « Non, je continue », « Oui, j’arrête de modérer ») et une phrase qui explique quand Memora te considère encore en train de modérer.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Vue Modérateur » en thème clair : elle reprend les couleurs de la page, et les pseudos du chat restent lisibles sur fond clair comme sur fond sombre.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration des menus « Modes » et « Options » du chat : une petite flèche les relie au bouton qui les ouvre.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration du menu des commandes du chat de la « Vue Modérateur » : les commandes sont regroupées en « Modération » et « Chat », et la recherche de la liste des viewers s’appelle « Recherche un viewer ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la liste de l’équipe dans la « Vue Modérateur » : elle se range en « Administration », « Coordination », « Référents », « Modérateurs » et « Juniors », et le nom de chaque rôle brille de sa couleur.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la page « Live » (avant « Live en cours ») : elle s’ouvre sur ton résumé, les lives en cours n’ont plus de page à part, et les notifications, l’accueil et l’alerte de début de live te ramènent ici.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        permission: Permissions.LiveRead,
        text: 'Amélioration de l’accueil : la liste des lives annoncés disparaît de l’appel au live, qui ne montre plus que les lives en cours.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la barre latérale : l’annonce d’une nouvelle note de mise à jour ne s’y accroche plus au raccourci « Nouveautés », elle reste sur l’accueil.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des mises à jour : l’écran qui proposait de recharger quand une nouvelle version de Memora est disponible disparaît.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de l’équipe dans la « Vue Modérateur » : chaque rôle a la même couleur dans la liste et dans le chat interne, la liste est triée par rôle, et une arrivée est signalée au survol.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de « Live en cours » : la sélection du créateur apparaît désormais dans la bannière.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration visuelle de « Live en cours » : la bulle de diffusion ressort mieux sur l’image de couverture.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de « Live en cours » : l’alerte d’un direct met plus clairement en évidence le créateur et l’accès à la page.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Vue Modérateur » : les symboles des sections correspondent désormais aux rôles et aux fonctions de l’équipe.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Vue Modérateur » : le nom des Juniors ressort désormais avec sa propre couleur.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration du « Bilan » d’un live : chaque geste de modération est rattaché à son modérateur, et une note signale les moments où aucun modérateur n’était connecté à Memora, avec leur durée.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des repères de présence : la pastille d’un membre se pose sur l’élément précis qu’il regarde ou modifie.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de « Memora Play » sur téléphone : le jeu s’ouvre désormais sans restriction.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de la salle de « Memora Play » : un décor de brumes qui dérivent derrière les parties.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration des bots de « Memora Play » : trois bots au plus par partie, et ils ne jouent plus au « Golf 3D ».',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la vitesse de Memora : la visite guidée, la recherche, l’assistant et la dernière note de mise à jour ne se chargent qu’au moment de s’en servir, le « Calendrier » et les coordinateurs font moins d’appels, et les reflets qui tournent en boucle sont plus fluides.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui enfonçait la flèche de visée dans les pentes au lieu de la poser dessus.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait un bumper posé sur une pente flotter dans le vide ou s’enfoncer dans le sol.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait une balle très rapide traverser un mur.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui comptait deux fois le choc entre deux balles en mouvement.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui faisait apparaître, depuis un trou voisin, des blocs cachés sur le parcours.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui comptait comme un coup de plus le rejeu d’une balle après un malus.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui effaçait un bonus armé pour le trou suivant dès l’ouverture de ce trou.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait activer un bonus sur le dernier trou, où il n’avait plus aucun effet : il reste maintenant en main.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait se téléporter sur un point hors du parcours ou trop loin de la balle.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui permettait de poser un pouvoir sur un trou qui n’était pas celui en cours.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui dessinait les ventilateurs sans les tourner dans le sens du vent.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait une scène blanche après la perte du contexte graphique du navigateur.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui faisait tirer les bots pendant que la balle roulait encore.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui privait le podium de ses touches pour rejouer ou quitter.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui cachait sur ordinateur les sorties du jeu dans les réglages, réservées jusque-là au téléphone.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui faisait clignoter le dessus de certains blocs et rails.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait des trous dans le sillage d’une balle très rapide.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui répétait l’alerte « Main pleine » à chaque passage sur une orbe.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’une lenteur dans « Golf » sur les parcours qui comptent beaucoup de plaques d’accélération.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui lançait les confettis au mauvais trou sur les parcours à plusieurs trous.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui ne tenait pas compte de l’ordre d’arrivée des pions pour départager les joueurs.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui renvoyait un pion mangé à la maison sans le montrer.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui numérotait mal les pions empilés à la maison.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Bombe » qui laissait un mot refusé dans la zone de saisie, à effacer à la main.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Bombe » qui mélangeait des syllabes faciles aux niveaux plus difficiles.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Bombe » qui faisait entendre à tous le bruit de la mèche, même quand la bombe n’était pas dans leurs mains.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Baccalauréat » qui partageait les points d’un mot refusé avec un mot identique.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Baccalauréat » qui faisait attendre la fin du minuteur pour compter les votes alors que tout le monde avait voté.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Baccalauréat » qui affichait le bouton d’arrêt alors que l’hôte avait désactivé l’arrêt manuel.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait ouvertes dans « Memora Play » des tables oubliées ou occupées par des bots seuls.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait modifier les règles d’une partie sans que les joueurs aient à confirmer de nouveau qu’ils étaient prêts.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui comptait avec retard l’abandon d’un joueur pendant une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui proposait d’inviter des joueurs déjà assis à la table.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’une lenteur à l’ouverture de « Memora Play », qui refaisait le ménage des tables à chaque page.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait la barre de discussion d’une partie flotter au lieu de rester collée en bas de l’écran sur téléphone.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui décalait la fenêtre d’invitation par rapport à son bouton.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui rouvrait le plein écran d’une partie sans que le joueur l’ait demandé.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui cachait « Enregistrer » et « Annuler » sur certains onglets des réglages d’une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui cachait les boutons d’enregistrement des formulaires par étapes selon la largeur de l’écran.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        permission: Permissions.AcademyManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug dans « Academy » qui réinitialisait l’état de tous les Référents d’une promotion dès qu’on la modifiait.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        permission: Permissions.AcademyReviewWrite,
        text: 'Correction d’un bug dans « Academy » qui laissait rédiger un bilan pour une autre étape que celle du Junior.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.academy,
        permission: Permissions.AcademyManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug dans « Academy » qui fermait le compte d’un modérateur déjà en place quand il quittait une promotion.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug dans « Recrutements » qui laissait un ancien membre sans accès quand il était de nouveau accepté.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionDiscordRead,
        text: 'Correction d’un bug dans « Panel de sanctions » qui fermait le panel Discord à ceux qui n’avaient que ce droit.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Correction d’un bug dans « Panel de sanctions » qui ouvrait le panel des lives aux équipes Discord et Animation.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui empêchait un candidat accepté d’être reconnu à sa connexion.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui cassait le retour de connexion Twitch, YouTube et Discord depuis les anciennes adresses.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.trainings,
        text: 'Correction d’un bug dans les exercices de mise en situation qui laissait la bonne question affichée après une vérification ratée.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug dans la visite guidée du « Calendrier » qui demandait de cliquer sur un bouton « Menu » absent.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.preferences,
        text: 'Correction d’un bug qui coupait les notifications du téléphone quand le navigateur perdait son abonnement : Memora le rétablit seul, sauf si tu les as désactivées toi-même.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui perdait l’ouverture d’une notification touchée sur téléphone.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui laissait un écran blanc au lancement d’une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui ralentissait la partie quand plusieurs bots jouaient.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Memora Play » qui ouvrait deux tables ou rejouait un geste sur un double clic.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui écrasait la map en un petit bandeau sur iPhone et empêchait de jouer.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans le vote du « Golf » qui faisait dépasser les noms des maps de leur étiquette sur mobile.',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        text: 'Une chasse aux bugs sur tous les jeux : Golf, Ludo, Bombe et Baccalauréat ont été passés au peigne fin, et chaque défaut croisé est corrigé dans cette version.',
      },
    ],
  },
  {
    version: '0.10.2',
    date: '2026-11-02',
    title: 'L’assistant et les pages privées arrivent !',
    intro:
      'Memora te parle maintenant : demande-lui une absence ou une mise à jour, elle s’en occupe. Et tes notes ont enfin leur place, rien qu’à toi ou partagées.',
    description:
      'Déclarer une absence ou mettre à jour un dossier obligeait à retrouver la bonne page, puis le bon formulaire, et les notes personnelles vivaient en dehors de Memora. Cette version ajoute un assistant qui mène la discussion pas à pas et des pages privées en blocs, à partager avec qui tu veux. Les réglages, les sanctions, les lives terminés et la page de statut gagnent aussi en clarté au passage, et les fiches de « Recrutements » se rangent mieux, avec un onglet de gestion et la blacklist.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Assistant Memora » : depuis la recherche et le bouton flottant, Memora te guide pas à pas dans une discussion, avec son cerveau animé et des réponses à cliquer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        permission: Permissions.AbsenceCreate,
        text: 'Ajout de la possibilité de déclarer une absence en discutant avec l’« Assistant Memora » : les dates sont demandées, un récapitulatif est proposé, puis « Oui » ou « Non » suffit pour valider.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de retrouver un candidat, un Junior, un entretien ou une tâche par son nom dans l’« Assistant Memora » et de modifier ses informations à sa place, selon tes accès.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de petites phrases de Memora près du bouton flottant « + » de chaque page, qui proposent le geste utile à cet endroit : déclarer une absence, ajouter un candidat, mettre à jour une tâche.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Pages privées » : des pages de notes à toi, ouvertes à tous les membres, avec un éditeur en blocs (menu « / » et barre de mise en forme).',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de partager une page privée avec des membres, un rôle ou tout Memora, avec le niveau d’accès choisi : lecture, commentaire, modification ou accès complet.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une « Corbeille » pour les pages privées : une page supprimée s’y restaure avec ses sous-pages, ou s’efface définitivement.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de modèles de pages, d’une recherche dans les pages ouvertes à toi, d’une icône et d’une couverture pour chaque page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de commenter une page privée, de copier son lien, de créer des sous-pages et de déplacer une page sous une autre.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de ranger tes pages privées dans des catégories du menu de gauche : « Créer une catégorie », glisser une page dedans ou dehors, renommer ou supprimer la catégorie d’un clic droit.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’une boîte sur l’accueil qui rassemble tes dernières pages visitées, tes pages privées et tes pages favorites.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’un mot de bienvenue de Memora à chaque arrivée sur l’accueil, depuis son bouton flottant, et d’une première phrase du chat qui change selon l’heure et cite ton nom.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de suggestions dans la recherche avant même de taper : tes dernières pages ouvertes et des demandes à faire à Memora.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une courte présentation en vidéo au milieu de l’écran à la première connexion après une mise à jour : le chat de l’assistant, une page privée qui se remplit puis son partage, avec pause et relecture.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de corriger un live terminé : renommer le live, modifier ou retirer un geste de modération et ajuster le temps d’un modérateur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de retirer, de rendre ou de supprimer les accès d’un Recruteur, d’un Observateur ou d’un Référent à une session, d’un clic droit sur sa ligne dans la « Participation » de sa fiche.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’un onglet par fonction dans la « Participation » de la fiche d’un modérateur : « Recrutement », « Académie » pour les Référents avec les Juniors pris en charge, et « Coordination » avec le temps passé et les actions effectuées en live.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.MemberRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de l’avatar du créateur sur chaque ligne de la « Participation », à la place de celui du modérateur.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration de « Recrutements » : déplacer la période d’une session décale aussi les étapes restées sur leur jour calculé et la date de la promotion de l’Académie liée.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction du choix des recruteurs d’une session de « Recrutements » : seuls ceux du créateur de la session étaient proposés, tous les Recruteurs le sont désormais.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’une boîte « Participants » dans la fiche d’une session de « Recrutements » : qui y est affilié, avec les accès retirés en rouge.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de réglages de confort dans « Paramètres » : fond du cadre, cartes, arrondis (francs par défaut), interligne, liens soulignés, animations et repère du clavier.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de modifier une page privée à plusieurs en même temps : les changements des autres apparaissent aussitôt, avec le curseur de chacun repéré par son avatar.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la présence sur une page privée : les avatars des membres qui la lisent s’affichent en haut de la page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’un « Historique des versions » pour les pages privées : lire une ancienne version, voir ce qui a changé depuis, puis la restaurer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de répondre à un commentaire d’une page privée, son auteur reçoit une notification « Réponse ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la présence sur un entretien : les avatars des recruteurs qui le suivent s’affichent, avec la question sur laquelle chacun se trouve.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de demander à rejoindre une partie déjà lancée : la demande s’affiche dans le chat de la partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’un onglet « Administration » dans une session de recrutement : l’identifiant de la session et les équipes (responsables, recruteurs, observateurs) s’y modifient.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’un onglet « Gestion » sur la fiche d’un candidat : l’identifiant du formulaire s’y modifie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de blacklister un candidat depuis l’onglet « Gestion » de sa fiche, ou de lever la mesure.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’une confirmation « Tu ne souhaites plus observer ce candidat ? » avec « Oui » ou « Non » avant de quitter une observation, et d’une animation de validation quand tu commences à observer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Ajout de la possibilité de lire le questionnaire d’un candidat que tu observes : « Afficher le questionnaire » apparaît sous « Tu observes ce candidat ! », dans une carte qui s’agrandit en douceur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une fenêtre « Concept » dans chaque jeu de « Memora Play » : trois courtes animations expliquent comment se déroule une partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un vote avant le lancement d’une partie de Baccalauréat, de Bombe ou de Ludo : les joueurs choisissent ensemble le format, la difficulté, les vies ou le nombre de pions.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une liste « En ce moment » dans « Memora Play » : les tables ouvertes ou en cours s’affichent avec le visage des joueurs, pour les rejoindre ou les regarder.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un « Son global » dans « Paramètres » et dans chaque jeu : un seul volume pour tous les jeux, un jeu réglé à part gardant le sien.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’onglets « Feed », « Chat » et « Tout » dans le chat d’une partie pour séparer les messages des événements de la table.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la présence dans les sections de Memora : les avatars des membres qui consultent la même section s’affichent dans la bannière de la page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Ajout d’une fiche du jour sur téléphone : toucher un jour du mois liste ses évènements, avec « Créer un autre évènement » ou « Demander un rendez-vous » juste dessous.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’accueil : la salutation et les raccourcis laissent place à des cartes « Les nouveautés » plus compactes, selon tes accès, et les tâches urgentes ne sont plus écrites en rouge.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la recherche : elle s’ouvre depuis un bouton de la barre du menu de gauche, et son champ reprend le style du chat de Memora.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : tes entretiens se lisent du plus récent au plus ancien dans une seule liste, et tes propres candidats passent en premier dans la liste des candidats.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de Memora : la main s’affiche au survol de tout ce qui se clique.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de la fiche d’un Junior : les compétences se notent en étoiles, dont la couleur passe du rouge au vert, avec la note de chaque catégorie résumée en étoiles.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.preferences,
        text: 'Amélioration de « Paramètres » : les onglets sont repensés, regroupés par réglage et illustrés. Le bouton « Récupérer mes données » quitte l’onglet « Confidentialité ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration du « Panel Twitch » : l’échelle de sanctions d’une infraction se lit et se modifie plus clairement, avec la gravité choisie parmi des barres de priorité.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.status,
        text: 'Amélioration de « Memora Status » : au survol d’une barre, une bulle indique le jour et l’état du service ce jour-là, et la ligne des 90 jours est mieux aérée.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de Memora : onglets et sélecteurs aux angles plus francs, verre des surfaces adouci.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.pages,
        text: 'Amélioration des pages privées : une modification faite en même temps par deux personnes ne demande plus de choisir une version, les changements se fondent ensemble.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : l’issue « En délibération » disparaît, les candidats concernés passent en « Mitigé ».',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu du compte : les dernières notifications s’y affichent, et le thème se change d’un clic sur la rangée des réglages.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : fixer le premier créneau d’un candidat te place comme recruteur si personne ne l’est et passe son issue à « Planifié ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche d’un candidat blacklisté : son nom passe en rouge avec un signe d’alerte et un message explique qu’il ne peut plus être pris en entretien. Seuls les responsables peuvent encore la modifier.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : l’onglet « Aperçu » d’une session regroupe l’état et la période, et la liste des candidats affiche l’issue de chacun.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Mes entretiens » : les entretiens se classent par statut puis par heure, et un bouton lecture ou œil remplace le bouton écrit.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche d’un candidat : l’heure de l’entretien s’écrit avec son jour, les informations tiennent sur une ligne, et sur téléphone la timeline passe sous les informations avec l’avatar dans la barre du haut.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de « Memora Play » : le décompte s’affiche au centre de la page avec un halo, l’invitation sonne plus bas et plus feutrée, et les tuiles de statistiques prennent la couleur de chaque jeu.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration du « Calendrier » sur téléphone : chaque évènement d’un jour du mois devient une pastille de couleur, les jours sont plus compacts et le sélecteur de mois disparaît.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Correction d’un bug dans « Recrutements » : un recruteur placé sur une session sans faire partie de l’équipe du créateur n’apparaissait pas dans la liste des recruteurs d’un candidat.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui coupait le panneau des notifications au niveau du menu de gauche.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.home,
        permission: Permissions.LiveLogRead,
        text: 'Correction d’un bug qui proposait sur l’accueil la tâche d’un bilan de live à des membres qui ne pouvaient pas l’ouvrir.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui faisait traverser les rampes à la visée et aux blocs.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui empêchait de sortir un pion avec un 1, et de manger un adversaire posé sur sa case de départ en sortant.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui empêchait d’afficher les invitations de parties dans « Memora Play ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui envoyait deux fois la même ligne dans le chat d’une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Golf » qui validait un trou dès le coup frappé, avant que la balle ne s’arrête.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui annonçait un déplacement dans le journal avant que le pion n’ait fini de bouger.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug dans « Ludo » qui faisait bouger le plateau à chaque tour, le message du tour garde maintenant sa place.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait un vote de lancement attendre indéfiniment quand son temps était écoulé : la partie démarre maintenant seule.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait voir le salon à travers l’écran de vote, et d’affichages mal alignés sur les votes de Baccalauréat, de Bombe et de Ludo.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui laissait des parties ouvertes ou fermées à l’affichage dans « Memora Play » : la liste se met maintenant à jour toute seule, et les parties ouvertes rejoignent la liste « En ce moment ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui coupait la fenêtre d’invitation de joueurs dans le chat d’une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug dans « Recrutements » qui gardait « En attente de son entretien » une fois l’heure du créneau passée, et affichait « Revoir l’entretien » avant qu’il ait eu lieu.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Correction d’un bug qui obligeait à recliquer dans le chat pour que la touche Alt fige de nouveau les messages, alors que cela ne marchait qu’une fois.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui montrait de nouveau la présentation en vidéo à chaque mise à jour de la version en cours, alors qu’elle avait déjà été vue.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui gardait l’ancienne version de Memora après avoir rechargé la page suite à une mise à jour.',
      },
    ],
  },
  {
    version: '0.10.1',
    date: '2026-11-02',
    title: 'L’assistant et les pages privées arrivent !',
    intro:
      'Memora te parle maintenant : demande-lui une absence ou une mise à jour, elle s’en occupe. Et tes notes ont enfin leur place, rien qu’à toi ou partagées.',
    description:
      'Déclarer une absence ou mettre à jour un dossier obligeait à retrouver la bonne page, puis le bon formulaire, et les notes personnelles vivaient en dehors de Memora. Cette version ajoute un assistant qui mène la discussion pas à pas et des pages privées en blocs, à partager avec qui tu veux. Les réglages, les sanctions, les lives terminés et la page de statut gagnent aussi en clarté au passage, et les fiches de « Recrutements » se rangent mieux, avec un onglet de gestion et la blacklist.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Assistant Memora » : depuis la recherche et le bouton flottant, Memora te guide pas à pas dans une discussion, avec son cerveau animé et des réponses à cliquer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        permission: Permissions.AbsenceCreate,
        text: 'Ajout de la possibilité de déclarer une absence en discutant avec l’« Assistant Memora » : les dates sont demandées, un récapitulatif est proposé, puis « Oui » ou « Non » suffit pour valider.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de retrouver un candidat, un Junior, un entretien ou une tâche par son nom dans l’« Assistant Memora » et de modifier ses informations à sa place, selon tes accès.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de petites phrases de Memora près du bouton flottant « + » de chaque page, qui proposent le geste utile à cet endroit : déclarer une absence, ajouter un candidat, mettre à jour une tâche.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Pages privées » : des pages de notes à toi, ouvertes à tous les membres, avec un éditeur en blocs (menu « / » et barre de mise en forme).',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de partager une page privée avec des membres, un rôle ou tout Memora, avec le niveau d’accès choisi : lecture, commentaire, modification ou accès complet.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une « Corbeille » pour les pages privées : une page supprimée s’y restaure avec ses sous-pages, ou s’efface définitivement.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de modèles de pages, d’une recherche dans les pages ouvertes à toi, d’une icône et d’une couverture pour chaque page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de commenter une page privée, de copier son lien, de créer des sous-pages et de déplacer une page sous une autre.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de ranger tes pages privées dans des catégories du menu de gauche : « Créer une catégorie », glisser une page dedans ou dehors, renommer ou supprimer la catégorie d’un clic droit.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’une boîte sur l’accueil qui rassemble tes dernières pages visitées, tes pages privées et tes pages favorites.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’un mot de bienvenue de Memora à chaque arrivée sur l’accueil, depuis son bouton flottant, et d’une première phrase du chat qui change selon l’heure et cite ton nom.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de suggestions dans la recherche avant même de taper : tes dernières pages ouvertes et des demandes à faire à Memora.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une courte présentation en vidéo au milieu de l’écran à la première connexion après une mise à jour : le chat de l’assistant, une page privée qui se remplit puis son partage, avec pause et relecture.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de corriger un live terminé : renommer le live, modifier ou retirer un geste de modération et ajuster le temps d’un modérateur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de réglages de confort dans « Paramètres » : fond du cadre, cartes, arrondis (francs par défaut), interligne, liens soulignés, animations et repère du clavier.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de modifier une page privée à plusieurs en même temps : les changements des autres apparaissent aussitôt, avec le curseur de chacun repéré par son avatar.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la présence sur une page privée : les avatars des membres qui la lisent s’affichent en haut de la page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’un « Historique des versions » pour les pages privées : lire une ancienne version, voir ce qui a changé depuis, puis la restaurer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de répondre à un commentaire d’une page privée, son auteur reçoit une notification « Réponse ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la présence sur un entretien : les avatars des recruteurs qui le suivent s’affichent, avec la question sur laquelle chacun se trouve.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de demander à rejoindre une partie déjà lancée : la demande s’affiche dans le chat de la partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout d’un onglet « Administration » dans une session de recrutement : l’identifiant de la session et les équipes (responsables, recruteurs, observateurs) s’y modifient.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’un onglet « Gestion » sur la fiche d’un candidat : l’identifiant du formulaire s’y modifie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de blacklister un candidat depuis l’onglet « Gestion » de sa fiche, ou de lever la mesure.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’une confirmation « Tu ne souhaites plus observer ce candidat ? » avec « Oui » ou « Non » avant de quitter une observation, et d’une animation de validation quand tu commences à observer.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’accueil : la salutation et les raccourcis laissent place à des cartes « Les nouveautés » plus compactes, selon tes accès, et les tâches urgentes ne sont plus écrites en rouge.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la recherche : elle s’ouvre depuis un bouton de la barre du menu de gauche, et son champ reprend le style du chat de Memora.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : tes entretiens se lisent du plus récent au plus ancien dans une seule liste, et tes propres candidats passent en premier dans la liste des candidats.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de Memora : la main s’affiche au survol de tout ce qui se clique.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de la fiche d’un Junior : les compétences se notent en étoiles, dont la couleur passe du rouge au vert, avec la note de chaque catégorie résumée en étoiles.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.preferences,
        text: 'Amélioration de « Paramètres » : les onglets sont repensés, regroupés par réglage et illustrés. Le bouton « Récupérer mes données » quitte l’onglet « Confidentialité ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration du « Panel Twitch » : l’échelle de sanctions d’une infraction se lit et se modifie plus clairement, avec la gravité choisie parmi des barres de priorité.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.status,
        text: 'Amélioration de « Memora Status » : au survol d’une barre, une bulle indique le jour et l’état du service ce jour-là, et la ligne des 90 jours est mieux aérée.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de Memora : onglets et sélecteurs aux angles plus francs, verre des surfaces adouci.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.pages,
        text: 'Amélioration des pages privées : une modification faite en même temps par deux personnes ne demande plus de choisir une version, les changements se fondent ensemble.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : l’issue « En délibération » disparaît, les candidats concernés passent en « Mitigé ».',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu du compte : les dernières notifications s’y affichent, et le thème se change d’un clic sur la rangée des réglages.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : fixer le premier créneau d’un candidat te place comme recruteur si personne ne l’est et passe son issue à « Planifié ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche d’un candidat blacklisté : son nom passe en rouge avec un signe d’alerte et un message explique qu’il ne peut plus être pris en entretien. Seuls les responsables peuvent encore la modifier.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : l’onglet « Aperçu » d’une session regroupe l’état et la période, et la liste des candidats affiche l’issue de chacun.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Mes entretiens » : les entretiens se classent par statut puis par heure, et un bouton lecture ou œil remplace le bouton écrit.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche d’un candidat : l’heure de l’entretien s’écrit avec son jour, les informations tiennent sur une ligne, et sur téléphone la timeline passe sous les informations avec l’avatar dans la barre du haut.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui coupait le panneau des notifications au niveau du menu de gauche.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.home,
        permission: Permissions.LiveLogRead,
        text: 'Correction d’un bug qui proposait sur l’accueil la tâche d’un bilan de live à des membres qui ne pouvaient pas l’ouvrir.',
      },
    ],
  },
  {
    version: '0.10.0',
    date: '2026-11-02',
    title: 'L’assistant et les pages privées arrivent !',
    intro:
      'Memora te parle maintenant : demande-lui une absence ou une mise à jour, elle s’en occupe. Et tes notes ont enfin leur place, rien qu’à toi ou partagées.',
    description:
      'Déclarer une absence ou mettre à jour un dossier obligeait à retrouver la bonne page, puis le bon formulaire, et les notes personnelles vivaient en dehors de Memora. Cette version ajoute un assistant qui mène la discussion pas à pas et des pages privées en blocs, à partager avec qui tu veux. Les réglages, les sanctions, les lives terminés et la page de statut gagnent aussi en clarté au passage.',
    items: [
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Assistant Memora » : depuis la recherche et le bouton flottant, Memora te guide pas à pas dans une discussion, avec son cerveau animé et des réponses à cliquer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.absences,
        permission: Permissions.AbsenceCreate,
        text: 'Ajout de la possibilité de déclarer une absence en discutant avec l’« Assistant Memora » : les dates sont demandées, un récapitulatif est proposé, puis « Oui » ou « Non » suffit pour valider.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la possibilité de retrouver un candidat, un Junior, un entretien ou une tâche par son nom dans l’« Assistant Memora » et de modifier ses informations à sa place, selon tes accès.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de petites phrases de Memora près du bouton flottant « + » de chaque page, qui proposent le geste utile à cet endroit : déclarer une absence, ajouter un candidat, mettre à jour une tâche.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Pages privées » : des pages de notes à toi, ouvertes à tous les membres, avec un éditeur en blocs (menu « / » et barre de mise en forme).',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de partager une page privée avec des membres, un rôle ou tout Memora, avec le niveau d’accès choisi : lecture, commentaire, modification ou accès complet.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’une « Corbeille » pour les pages privées : une page supprimée s’y restaure avec ses sous-pages, ou s’efface définitivement.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de modèles de pages, d’une recherche dans les pages ouvertes à toi, d’une icône et d’une couverture pour chaque page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de commenter une page privée, de copier son lien, de créer des sous-pages et de déplacer une page sous une autre.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de ranger tes pages privées dans des catégories du menu de gauche : « Créer une catégorie », glisser une page dedans ou dehors, renommer ou supprimer la catégorie d’un clic droit.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’une boîte sur l’accueil qui rassemble tes dernières pages visitées, tes pages privées et tes pages favorites.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’un mot de bienvenue de Memora à chaque arrivée sur l’accueil, depuis son bouton flottant, et d’une première phrase du chat qui change selon l’heure et cite ton nom.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de suggestions dans la recherche avant même de taper : tes dernières pages ouvertes et des demandes à faire à Memora.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une courte présentation en vidéo au milieu de l’écran à la première connexion après une mise à jour : le chat de l’assistant, une page privée qui se remplit puis son partage, avec pause et relecture.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveLogRead,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de corriger un live terminé : renommer le live, modifier ou retirer un geste de modération et ajuster le temps d’un modérateur.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de réglages de confort dans « Paramètres » : fond du cadre, cartes, arrondis (francs par défaut), interligne, liens soulignés, animations et repère du clavier.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de modifier une page privée à plusieurs en même temps : les changements des autres apparaissent aussitôt, avec le curseur de chacun repéré par son avatar.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la présence sur une page privée : les avatars des membres qui la lisent s’affichent en haut de la page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout d’un « Historique des versions » pour les pages privées : lire une ancienne version, voir ce qui a changé depuis, puis la restaurer.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.pages,
        text: 'Ajout de la possibilité de répondre à un commentaire d’une page privée, son auteur reçoit une notification « Réponse ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la présence sur un entretien : les avatars des recruteurs qui le suivent s’affichent, avec la question sur laquelle chacun se trouve.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de demander à rejoindre une partie déjà lancée : la demande s’affiche dans le chat de la partie.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’accueil : la salutation et les raccourcis laissent place à des cartes « Les nouveautés » plus compactes, selon tes accès, et les tâches urgentes ne sont plus écrites en rouge.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la recherche : elle s’ouvre depuis un bouton de la barre du menu de gauche, et son champ reprend le style du chat de Memora.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : tes entretiens se lisent du plus récent au plus ancien dans une seule liste, et tes propres candidats passent en premier dans la liste des candidats.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de Memora : la main s’affiche au survol de tout ce qui se clique.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de la fiche d’un Junior : les compétences se notent en étoiles, dont la couleur passe du rouge au vert, avec la note de chaque catégorie résumée en étoiles.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.preferences,
        text: 'Amélioration de « Paramètres » : les onglets sont repensés, regroupés par réglage et illustrés. Le bouton « Récupérer mes données » quitte l’onglet « Confidentialité ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration du « Panel Twitch » : l’échelle de sanctions d’une infraction se lit et se modifie plus clairement, avec la gravité choisie parmi des barres de priorité.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.status,
        text: 'Amélioration de « Memora Status » : au survol d’une barre, une bulle indique le jour et l’état du service ce jour-là, et la ligne des 90 jours est mieux aérée.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de Memora : onglets et sélecteurs aux angles plus francs, verre des surfaces adouci.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.pages,
        text: 'Amélioration des pages privées : une modification faite en même temps par deux personnes ne demande plus de choisir une version, les changements se fondent ensemble.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : l’issue « En délibération » disparaît, les candidats concernés passent en « Mitigé ».',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu du compte : les dernières notifications s’y affichent, et le thème se change d’un clic sur la rangée des réglages.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui coupait le panneau des notifications au niveau du menu de gauche.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.home,
        permission: Permissions.LiveLogRead,
        text: 'Correction d’un bug qui proposait sur l’accueil la tâche d’un bilan de live à des membres qui ne pouvaient pas l’ouvrir.',
      },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-11-01',
    title: 'Memora devient une App !',
    intro:
      'Memora s’installe sur ton téléphone ou ton ordinateur comme une vraie application, avec ses notifications et une barre du bas pensée pour le pouce.',
    description:
      'Ouvrir Memora demandait de passer par le navigateur et de revenir voir la cloche pour ne rien rater. Cette version la rend installable, lui donne une icône sur ton écran d’accueil et t’envoie tes notifications directement sur ton appareil, même quand elle est fermée. Le logo, l’écran de chargement et le menu du téléphone se refont une beauté au passage.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la possibilité d’installer Memora comme une application sur ton téléphone ou ton ordinateur, avec son icône et en plein écran.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la possibilité de recevoir les notifications sur ton appareil, même quand Memora est fermée, avec le choix des familles reçues, la liste des appareils abonnés et un bouton d’essai.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        text: 'Ajout d’une invitation sur l’accueil pour activer les notifications sur ton appareil.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.status,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Memora Status » : l’état de Memora et de ses services sur les 90 derniers jours, ouvert à tous, même sans être connecté.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        text: 'Ajout de la possibilité de choisir les pages de la barre du bas sur téléphone, avec un aperçu et un retour aux pages proposées.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’un message quand la connexion est perdue, et d’un écran plein cadre qui propose de recharger quand une nouvelle version de Memora est disponible.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de Memora : nouveau logo, nouvelles icônes d’application et écran de chargement avec le cerveau de Memora.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la barre du bas sur téléphone : un verre transparent qui laisse voir la page, et un point rouge sur « Menu » quand une notification attend.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration du menu « Compte » sur téléphone : il monte depuis le bas de l’écran avec le créateur affiché, le thème, « Paramètres » et la déconnexion.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des bulles de notification : elles n’apparaissent plus sur téléphone, où elles ne pointaient vers rien.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration du « Calendrier » sur téléphone : le titre du mois s’affiche en entier.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration du « Panel Twitch » : la fiche d’une infraction se range en onglets, avec un onglet « Détection » pour ses mots-clés, ses exemples modérés ou tolérés et un test de message.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Amélioration de « Recrutements » : un observateur ne lit plus les remarques de l’équipe, les conseils des questions ni les liens d’exercice.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de l’entretien de « Recrutements » sur téléphone : la bannière laisse place au logo du créateur, centré en haut, pour garder la place aux questions.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Amélioration de « Recrutements » : les recruteurs d’un entretien terminé peuvent toujours être changés, seuls les observateurs restent verrouillés.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration du « Calendrier » de « Recrutements » : l’encart « Prochains entretiens » disparaît, le planning par période suffit.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Modérateurs » : un candidat accepté reste avec les candidats jusqu’au début de sa procédure académique.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug sur téléphone qui faisait passer la barre du haut sous l’heure et la batterie dans l’application installée.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Correction d’un bug de « Recrutements » qui empêchait un recruteur de s’installer comme observateur dans un entretien.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Correction d’un bug de « Recrutements » qui obligeait à recharger la page pour voir qu’on avait rejoint ou quitté un entretien comme observateur.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Correction d’un bug de « Recrutements » où les avis « favorable », « mitigé » et « défavorable » manquaient sur certains environnements.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.teams,
        permission: Permissions.ReferenceManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug qui privait certains créateurs des équipes « Observateurs » et « Coordinateur de Live ».',
      },
    ],
  },
  {
    version: '0.8.2',
    date: '2026-10-31',
    title: 'Correctifs & Amélioration - Recrutement',
    intro:
      'Le recrutement change de visage : une fiche candidat en onglets, un entretien plus fluide, un historique et une page « Moi » pour suivre ton activité.',
    description:
      'Mener un entretien, écrire un bilan ou retrouver un ancien candidat demandait trop de clics et laissait peu de traces. Cette version range la fiche candidat par onglets, laisse commenter chaque question pendant l’entretien, garde l’historique de tous les candidats et permet d’écarter un identifiant en cas d’abus de confidentialité. Les logos et bannières des créateurs ont aussi leurs emplacements dédiés.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        text: 'Ajout d’un onglet « Historique » dans « Recrutements » : les candidats de toutes les sessions s’y retrouvent par leur identifiant Discord ou leur nom.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de blacklister un identifiant Discord, avec un motif visible des Responsables : il ne peut plus être ajouté à une nouvelle session, et la blacklist se lève à tout moment.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de clôturer une session de recrutement depuis sa page, après confirmation, ce qui lance la procédure académique des candidats acceptés.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout d’un onglet « Moi » dans une session : les entretiens du jour et du lendemain, « Mes entretiens », « Mes observations », ainsi que « Mes chiffres » (entretiens, observations, présence, décisions et duo préféré).',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout de la possibilité de commenter chaque question pendant un entretien, d’épingler un commentaire et de choisir entre vouvoiement et tutoiement pour lire les questions.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout de la possibilité de plusieurs recruteurs sur un même candidat, et de rendre un avis « favorable », « mitigé » ou « défavorable » en fin d’entretien.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout d’une tâche « Tu dois remplir le bilan candidat de… » dès qu’un entretien est terminé.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        permission: Permissions.RecruitmentRead,
        text: 'Ajout des candidats acceptés dans « Modérateurs », avec un lien vers leur fiche de recrutement.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        text: 'Ajout d’un bloc « Participation » sur la fiche d’un modérateur : les entretiens menés et observés pendant les sessions de recrutement.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.teams,
        permission: Permissions.ReferenceManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de définir le logo, la bannière principale et la bannière estompée de chaque créateur depuis sa fiche.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche candidat de « Recrutements » : elle se range en onglets « Aperçu », « Bilan », « Exercices » et « Timeline », avec un retour vers la liste des candidats.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la liste des candidats de « Recrutements » : filtres par statut et par recruteur, et tri par ordre alphabétique, par entretien ou par identifiant Discord.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration du planning des entretiens de « Recrutements » : il s’affiche sur la période choisie, et non plus sur la semaine seule.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration du questionnaire d’entretien de « Recrutements » : questions reformulées, sous-questions repliables et durée réelle de l’entretien affichée.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de « Recrutements » : les « Issues » deviennent des « Statuts », et la fiche d’une session se met à jour en direct pour tous ceux qui l’ouvrent.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Amélioration de la page « Panel de sanctions » : elle devient « Panel Twitch » et suit le créateur choisi dans la navigation.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        text: 'Amélioration de « Modérateurs » : le statut « Academy » devient « En formation », et la recherche ignore désormais les accents.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’accueil : le bloc des anniversaires couvre le mois entier.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des images envoyées sur Memora : elles sont compressées pour s’afficher plus vite.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionRead,
        text: 'Correction d’un bug qui laissait la page « Panel Twitch » sur un autre créateur que celui choisi.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Correction d’un bug qui proposait des suggestions vides dans la « Mod View ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Correction d’un bug de « Recrutements » qui proposait n’importe quel membre comme observateur : seuls les membres de l’équipe « Observateurs » sont proposés, et ceux déjà placés restent en place.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug de « Recrutements » qui retirait des observateurs de leurs entretiens à chaque modification de la session.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Correction d’un bug de « Recrutements » qui empêchait de quitter un entretien où l’on avait été placé comme observateur, et laissait le bouton « Observer » sur l’ancien état.',
      },
    ],
  },
  {
    version: '0.8.1',
    date: '2026-10-27',
    title: 'Les suggestions visent plus juste !',
    intro:
      'La « Mod View » propose désormais la bonne infraction du « Panel de sanctions » plus souvent, et les Responsables peuvent la guider avec leurs propres mots.',
    description:
      'Jusqu’ici, la suggestion se fiait surtout à la catégorie d’AutoMod, ce qui menait souvent à une infraction approximative. Cette version la fait lire le message lui-même : les mots de détection que les Responsables ajoutent à chaque infraction passent en premier, puis les mots de son nom et de ses exemples. Une sanction donnée à la main compte aussi sur le bon palier.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.sanctions,
        permission: Permissions.SanctionManage,
        audience: ChangelogAudiences.Responsables,
        text: 'Ajout de la possibilité de renseigner des « Mots de détection » sur chaque infraction du « Panel de sanctions », un par ligne, pour guider la suggestion de la « Mod View ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Amélioration des suggestions de la « Mod View » : l’infraction proposée se choisit d’après les mots du message, les mots de détection de l’infraction d’abord, puis ceux de son nom et de ses exemples.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Amélioration de la « Mod View » : une sanction donnée à la main compte sur le palier que la suggestion proposait pour ce viewer.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Amélioration de la « Mod View » : une modification du « Panel de sanctions » atteint les suggestions d’un live en cours sans recharger la page.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Amélioration de la « Mod View » : la colonne latérale peut s’élargir bien plus qu’avant.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui renvoyait le curseur au début d’une fenêtre ouverte de la « Mod View » à chaque rafraîchissement du live.',
      },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-10-26',
    title: 'Memora Play est là !',
    intro:
      'Memora ouvre sa salle de jeux : retrouve les autres membres pour une partie de Golf, de Baccalauréat, de Bomb Party ou de Ludo.',
    description:
      'Memora n’offrait aucun moment de détente entre deux lives, et rien ne rapprochait les équipes en dehors du travail. Cette version ajoute « Memora Play », avec quatre jeux, un chat de partie, des niveaux, un classement et des trophées, puis fait du « Golf » un vrai jeu de société en 3D. Elle précise aussi les « Recrutements » : recruteurs d’une session, étapes validées dans l’ordre et annonce copiée en deux temps.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Memora Play » : une salle de jeux pour créer une partie, la rejoindre depuis le salon et inviter les autres membres.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout du jeu « Baccalauréat » : une lettre, des catégories, le plus rapide gagne, avec jokers, mode flash, tournois, spectateurs et revanche.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout du jeu « Bomb Party » : une syllabe, un mot, et la bombe passe au joueur suivant avant d’exploser.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout du jeu « Ludo » : de un à quatre joueurs lancent le dé chacun leur tour et ramènent leurs pions à la maison, en mangeant ceux des autres sur le chemin.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de régler une partie de « Ludo » : nombre de pions, temps par tour, faces du dé qui sortent un pion, fin au premier arrivé ou au podium, et règles comme le rejeu sur un six.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout, pendant une partie de « Ludo », d’un dé lancé sur le plateau, de pions qui avancent case par case, d’un journal des derniers événements et de bruitages à chaque lancer, capture et arrivée.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout du jeu « Golf » : un parcours en 3D où jusqu’à quinze joueurs jouent en même temps, on tire la balle vers l’arrière pour viser et le moins de coups gagne.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de trois formats dans le « Golf », choisis au lancement : « Casual » sur un parcours, « Tournoi » sur plusieurs parcours aux scores additionnés, et « Chaos jubilatoire » avec quatre fois plus d’orbes, deux fois plus de malus et cinq pouvoirs en main.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de cinq parcours de six trous dans le « Golf » : « La Prairie », « Le Canyon », « Les Tropiques », « L’Espace » et « La Plage », ou un parcours tiré au hasard.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’obstacles sur les parcours du « Golf » : ventilateurs, portails, trous noirs, totems, eau et glace.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de dix-huit pouvoirs dans le « Golf », gagnés en roulant sur les orbes et gardés en main, trois au plus : Tornade, Murs collants, Glace, Balle géante, Balle mini, Anti-collision, Bumper, Balle fantôme, Ventilos, Pet cosmique, Turbo farceur, Flash, Main sûre, Flèche tordue, Miroir, À l’aveugle, Lob et Échange, en vert pour les bonus et en rouge pour les malus.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de régler une partie de « Golf » : format, nombre de trous, temps par trou, coups limités ou illimités, collisions entre balles et pouvoirs disponibles.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout, pendant une partie de « Golf », d’un journal des derniers événements, du tableau des coups de chaque joueur sur le trou en cours et d’un classement trou par trou.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de réglages d’affichage dans le « Golf » : son et volume, sillage des balles, brume, particules et mode léger.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de bruitages et d’animations dans le « Golf » : tir, rebonds, pouvoirs, trou rentré, et un podium avec trophée pour les gagnants.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un chat dans chaque partie et d’invitations, comme joueur ou comme spectateur, qui apparaissent en bas de l’écran.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.home,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’une bulle d’invitation près de la cloche : quand un membre t’invite à jouer ou à regarder sa partie, tu peux l’accepter ou la refuser sans quitter ta page.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de rejouer : à la fin d’une partie simple, l’hôte ouvre une nouvelle partie en un clic et les autres joueurs la rejoignent.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité, pour l’hôte, de modifier les règles d’une partie tant qu’elle n’a pas commencé.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de l’expérience dans « Memora Play » : des niveaux de Découverte à Légendaire, un classement par jeu, des trophées et des statistiques détaillées par joueur, avec l’XP gagnée qui s’envole en fin de partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.preferences,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un onglet « Memora Play » dans les « Préférences », avec son niveau, ses statistiques et ses trophées.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.PlayManage,
        text: 'Ajout de la possibilité, depuis la fiche d’un modérateur, de lui donner de l’expérience, de fixer son niveau, de remettre ses statistiques à zéro ou de le sortir de sa partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentManage,
        text: 'Ajout de la possibilité de choisir les « Recruteurs » d’une session, parmi les modérateurs qui ont cette fonction, à côté des responsables et des observateurs.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la barre latérale : le raccourci « Play » brille en doré pour se repérer d’un coup d’œil.',
        permission: Permissions.PlayAccess,
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de la barre latérale : le voile pâle derrière le cadre disparaît, la barre et la page partagent le même fond.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration visuelle de la page « Play » : les jeux s’affichent en grandes affiches, chacune avec son bouton « Jouer ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du podium de fin de « Bomb Party » : le nom de chaque joueur s’affiche sous sa photo.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de « Bomb Party » : le dernier mot proposé par chaque joueur reste affiché sous son nom.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de « Bomb Party » : des bruitages accompagnent la mèche, la frappe, le mot trouvé, l’explosion et la victoire.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Baccalauréat » : les votes sur les réponses affichent le visage de chaque joueur qui a accepté ou refusé, et la progression des joueurs se met à jour en direct.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de « Memora Play » : les parties, les messages du chat et les invitations arrivent tout de suite, sans recharger la page.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Golf » : une fois ton trou fini, tu peux encore jouer tes malus contre les autres, mais plus tes bonus.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du « Baccalauréat » : le bouton « Stop » termine la manche tout de suite, sans les dix secondes de grâce.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’« Accueil » : la page « Ton Accueil » est renommée « Accueil ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration des « Recrutements » : le bouton de l’annonce copie d’abord le texte, puis l’image du planning au clic suivant, pour que Discord garde les deux.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration visuelle des frises des « Recrutements » : le trait entre deux étapes est en pointillés et passe au vert quand l’étape est faite.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration de la fiche d’un candidat : sa présence s’affiche avec une coche verte ou une croix rouge.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentManage,
        text: 'Amélioration des « Recrutements » : valider une étape de la frise d’une session demande une confirmation, et les étapes se valident dans l’ordre, seule la suivante se coche et seule la dernière se rouvre.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui enregistrait une date avec heure dès que l’heure changeait, avant la fin de la saisie.',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui teintait la barre du navigateur aux couleurs de la carte de partage de Memora.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Correction d’un bug qui empêchait de décocher une étape de la frise d’un candidat ou de cocher l’étape « Entretien » à la main.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui coupait le premier chiffre du décompte avant une partie.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui permettait de lancer le dé ou de jouer un pion deux fois de suite dans le « Ludo » avant l’arrivée du nouveau plateau.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui rejouait la sonnerie « à ton tour » à chaque lancer bonus dans le « Ludo ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui n’indiquait pas le nom du pion mangé dans le journal du « Ludo ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui faisait tourner la caméra du « Golf » dans le sens inverse du glissé.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui faisait vibrer un bumper du « Golf » après la fin de son rebond.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui empêchait de quitter le plein écran sur le podium du « Golf ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Correction d’un bug qui faisait flotter de haut en bas l’avatar du joueur dont c’est le tour dans le « Ludo ».',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un vote de lancement dans le « Golf » : chaque joueur choisit le type de partie puis le parcours, avec 15 secondes par étape et les avatars des votants.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de passer une partie de « Memora Play » en plein écran, le chat s’ouvrant par-dessus la table.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout d’un décompte sonore avant le départ d’une partie.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Ajout de la possibilité de jouer plusieurs parties en même temps, à condition que ce soit des jeux différents : lancer une nouvelle partie d’un jeu ferme ta précédente partie de ce jeu.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration visuelle du salon d’une partie : avatars plus grands et mention du rôle de chaque joueur.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration visuelle du profil « Memora Play » : un glyphe devant chaque statistique et la couleur du jeu sur les niveaux.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration du confort dans le « Ludo » : pions qui avancent à un rythme plus posé, journal des événements plus lisible, nouveaux bruitages de dé et bruit de pion posé sur la table à chaque case, avec les sons du six et de la sortie d’un pion.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de la fluidité du « Golf » : la caméra suit la balle sans à-coups et glisse en douceur vers la vue d’ensemble, avec un décompte de départ de cinq secondes et une vue plus reculée.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de la difficulté dans le « Golf » : le parcours « Les Tropiques » perd le ventilateur de sa jetée, pour un passage moins punitif.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.play,
        permission: Permissions.PlayAccess,
        text: 'Amélioration de la difficulté dans le « Ludo » : deux pions ne partagent plus jamais une case, ce qui rend les déplacements plus tactiques et l’option « Barrières » inutile.',
      },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-10-21',
    title: 'Une flopée de correctifs !',
    intro:
      'Memora accueille un nouveau rôle, une quatrième division et des icônes entièrement redessinées.',
    description:
      'Il manquait un niveau entre l’Admin et les Responsables, la liste des Modérateurs mélangeait l’encadrement et les modérateurs, et les icônes de rôles, de fonctions et de divisions n’étaient pas toutes à la hauteur. Cette version ajoute le rôle Employé, range chaque YouTubeur par Administration puis par fonction, redessine les icônes et corrige plusieurs bugs des Lives et du Calendrier.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout d’un nouveau rôle « Employé » : placé entre Admin et Responsable, il dispose des droits d’un Responsable et voit tous les YouTubeurs, même les nouveaux.',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Ajout de la possibilité, pour un Admin, d’ouvrir sa propre fiche dans « Modérateurs » et de la modifier.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une quatrième division, « Division IV », réservée aux Responsables, avec son emblème doré.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la page « Modérateurs » : chaque YouTubeur sépare l’« Administration », avec l’Admin en premier puis les Responsables, des modérateurs, rangés par fonction puis par ordre alphabétique.',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout de la mise à jour en direct des accès : un changement de rôle, de fonction, de division ou de droit s’applique sans recharger la page.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle des icônes de rôles et de fonctions : Admin, Employé et Modérateur, Discord, Lives et YouTube sont redessinés, avec une couronne qui scintille et une flamme qui crépite.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle des divisions : « Squad I », « Squad II » et « Squad III » deviennent « Division I », « Division II » et « Division III », chacune avec un écusson qui gagne un chevron.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la page « Modérateurs » : la carte d’un Admin, d’un Employé ou d’un Responsable affiche l’emblème de son rôle plutôt que ceux de ses fonctions.',
      },
      {
        tag: ChangelogTags.Improved,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration des divisions : tous les Responsables rejoignent la « Division IV ».',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration des « Recrutements » : le bouton « Copier » de l’annonce copie le texte et l’image du planning en une seule fois.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Amélioration des « Recrutements » : une session sans consigne affiche « Aucune consigne n’a été communiquée pour le moment » aux membres qui ne peuvent pas en écrire.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.home,
        text: 'Amélioration de l’« Accueil » : une liste « Tes tâches » vide affiche une simple phrase.',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        text: 'Amélioration du « Calendrier » sur téléphone : une vue sur trois jours, une barre de navigation par mois et des évènements colorés selon leur calendrier.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration de la barre du haut sur téléphone : le fil de navigation de la page et ses options s’y affichent, à côté du menu.',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des formulaires sur téléphone : le clavier ne s’ouvre plus tout seul à l’ouverture d’une fenêtre.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui comptait du temps de modération à des membres qui ne modéraient pas la chaîne du « Live ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Correction d’un bug qui laissait le « Panel de sanctions » proposer le mauvais palier quand Twitch refusait une sanction.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui gardait l’heure de fin dans le « Calendrier » après la réouverture d’un « Live ».',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui ouvrait parfois deux temps de modération pour la même personne avec deux onglets ouverts.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui pouvait vider le chat de la « Mod View » après deux reconnexions rapprochées.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Correction d’un bug qui affichait une attente trop courte quand Twitch limitait les actions de modération.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Correction d’un bug qui ne démarrait pas automatiquement un « Live » lancé plus de 90 minutes avant l’heure prévue : il est désormais suivi de 2 heures avant à 2 heures après.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Correction d’un bug qui enregistrait parfois un mauvais pseudo sur un commentaire laissé à un viewer.',
      },
      {
        tag: ChangelogTags.Fixed,
        audience: ChangelogAudiences.Responsables,
        text: 'Correction d’un bug qui laissait une note privée lisible dans le journal d’activité.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction de plusieurs bugs du « Calendrier » sur les heures d’appel, les bilans annuels et les évènements d’équipe.',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        text: 'Correction d’un bug qui ajoutait tous les membres à l’« Appel de présence » d’un live quand on en modifiait le titre depuis le « Calendrier ».',
      },
      {
        tag: ChangelogTags.Fixed,
        text: 'Correction d’un bug qui affichait certaines heures dans le mauvais fuseau horaire.',
      },
    ],
  },
  {
    version: '0.6.3',
    date: '2026-10-21',
    title: 'Le calendrier s’organise',
    intro:
      'Le calendrier gagne des modèles d’évènements, des bilans annuels à réserver et des filtres plus clairs.',
    description:
      'Poser un évènement demandait de tout remplir à la main, les bilans annuels se géraient hors de Memora et le panneau de filtres du calendrier mélangeait tout. Cette version propose des modèles prêts à l’emploi, organise les bilans annuels par créneaux de 15 minutes et sépare clairement les filtres par type et par calendrier.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout d’une nouvelle fonctionnalité nommée « Bilans annuels » : un Responsable ouvre une période de créneaux de 15 minutes pour son équipe, avec une seule équipe par série et la sienne déjà choisie',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout d’un projet « Bilans annuels » créé en même temps que la période, avec ses tâches déjà préparées : les Responsables rédigent les questions, chaque modérateur prépare son bilan, et un message confirme « Le projet a bien été créé »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout de la possibilité de prendre un créneau de « Bilans annuels » d’un clic, de le déplacer ou de l’annuler, avec un seul créneau à la fois par modérateur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout de la possibilité pour un Responsable de placer un modérateur sur un créneau de « Bilans annuels » à sa place',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout d’un bouton « Supprimer tous les créneaux non pris. » en cliquant sur le titre de la période de « Bilans annuels »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout d’un rappel envoyé deux jours avant la fin d’une période de « Bilans annuels » aux modérateurs qui n’ont pas encore pris de créneau',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout de la fermeture automatique des créneaux libres d’une période de « Bilans annuels » quand tous les modérateurs de l’équipe ont leur créneau',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.meetings,
        permission: Permissions.MeetingRead,
        text: 'Ajout d’une seule fiche de réunion par période de « Bilans annuels » dans « Réunions », au public « L’équipe concernée », avec tous les modérateurs de l’équipe comme participants et seule la date modifiable',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.meetings,
        permission: Permissions.MeetingRead,
        text: 'Ajout d’un petit calendrier du mois sur la fiche d’un bilan annuel de la page « Réunions », avec le nombre de créneaux pris chaque jour',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ProjectDelete,
        text: 'Ajout de la suppression en cascade d’un projet « Bilans annuels » après confirmation : la période, les créneaux, la fiche de réunion et les tâches disparaissent ensemble',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout des créneaux libres regroupés en « N créneaux libres » sur le calendrier, avec les heures détaillées à droite d’un séparateur dans le détail, pour garder une page fluide',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout de titres lisibles sur les créneaux de « Bilans annuels » : « Bilan annuel non posé » en gris pour un créneau libre et « Bilan annuel de » suivi du nom en rose pour un créneau pris',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout de modèles d’évènements classés par catégorie (Réunions, Lives, Academy, Recrutement, Technique), avec un choix de type d’abord puis un modèle : « Un type doit d’abord être choisi ! » tant qu’aucun n’est sélectionné',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout des modèles « Live YouTube » et « Live Twitch » : la plateforme vient du modèle, « Live YouTube » reste grisé tant que les Lives YouTube ne sont pas disponibles, et les deux Coordinateurs de Live qui ont coordonné le moins récemment et qui ne sont pas absents sont proposés',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberUpdate,
        text: 'Ajout de la fonction secondaire « Coordinateur de Live » : ses porteurs sont proposés en premier pour coordonner un Live, avant les Responsables puis les Administrateurs',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout d’un lien vers la page du live dans le détail d’un évènement de live : « Tu as notifié être présent » puis « Le lien : Live en cours » quand il a démarré',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Ajout des modèles « Réunion d’équipe Lives » (samedi 18 h 30) et « Réunion d’équipe Discord » (samedi 17 h 30) : l’équipe et ses Responsables sont convoqués, la visibilité reste celle de l’équipe, et « Membres en plus » propose les membres d’autres équipes et les YouTubeurs selon les droits de chacun',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout des modèles « Réunion Marsha » et « Administration entière » : le public est fixé et expliqué au survol, et l’administrateur principal est le Responsable',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout des modèles « Zone de recrutement » et « Zone Academy », liés aux sessions en cours : grisés avec « Aucune session en cours pour ce modèle. » tant qu’il n’y en a pas, et les dates se remplissent depuis la session',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout des modèles d’entrevues « Junior <> Référents » : on choisit la session, les référents de la session sont convoqués et les Responsables des équipes du YouTubeur sont les Responsables de l’entrevue',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Ajout des « Bilans de fin de période » créés automatiquement sept jours avant la fin d’une période, visibles des Responsables et des Référents, et disponibles dans les modèles seulement pendant cette fenêtre',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout d’un choix d’émoji à droite de la boîte du titre d’un évènement, tiré au hasard quand aucun n’est choisi',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration du panneau de filtres du « Calendrier » : un onglet « Types » pour afficher ou masquer les zones, les périodes et les évènements, et un onglet « Filtres » pour les calendriers et les YouTubeurs',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration des calendriers filtrables : « Lives » et « Bilans annuels » rejoignent « Évènements », « Réunions », « Absences », « Anniversaires », « Academy » et « Recrutements », chaque évènement allant dans le calendrier de son modèle',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration visuelle du panneau de filtres : une ligne cochée a un voile vert dégradé et sa coche verte remplace son glyphe, et une bulle instantanée explique chaque type au survol',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration visuelle des évènements du « Calendrier » : des cartes pleines teintées sans contour, avec une ombre, un texte noir (blanc en mode sombre) et l’heure en petit au-dessus',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration des zones du « Calendrier » : toujours sur la journée entière, avec un grand titre très pâle qui n’apparaît qu’au survol, derrière les cartes, sans être coupé ni répété, et les titres de plusieurs zones sur les mêmes jours réunis par « & »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration des périodes du « Calendrier » : un grand cadre arrondi qui entoure ses évènements, avec un titre en lettres larges et une forte ombre',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration de l’option « Toute la journée » : les heures se grisent et une bulle instantanée dit « L’évènement dure toute la journée ! » en pointant le champ',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration des champs grisés d’un formulaire : une bulle instantanée explique pourquoi un champ ne peut pas être modifié, par exemple un public fixé par le modèle',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration de l’appel de présence : une liste compacte avec l’avatar à gauche et un petit nom, sans boîte autour de chaque personne',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.dashboard,
        text: 'Amélioration de la sollicitation de présence : la phrase « Ta présence est sollicitée… » met le jour et l’heure en gras',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration visuelle des bulles du « Calendrier » : elles pointent l’évènement et s’affichent au-dessus de tout, sans être coupées',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Amélioration de la modification d’une période : les nouveaux jours et les nouvelles heures s’appliquent vraiment',
      },

      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Correction d’un bug qui effaçait le titre, le projet et les dates d’une période du « Calendrier » quand on la modifiait',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui laissait les bulles du « Calendrier » coupées par le cadre qui les contient',
      },

      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        permission: Permissions.MeetingRead,
        text: 'Correction d’un bug qui effaçait le titre de la fiche d’un bilan annuel dans « Réunions » après une modification',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui rendait invisible le grand titre d’une zone du « Calendrier » au survol, caché derrière son fond',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui coupait ou répétait le titre d’une zone du « Calendrier » quand elle s’étendait sur plusieurs semaines',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui laissait voir à travers les cartes du « Calendrier » ce qu’elles recouvraient, par manque d’opacité',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui laissait déborder les titres longs hors des cartes du « Calendrier » au lieu de passer à la ligne',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui laissait un créneau de « Bilans annuels » déjà pris par quelqu’un d’autre visible et réservable',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui ralentissait fortement le « Calendrier » quand une période de « Bilans annuels » comptait beaucoup de créneaux',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.projects,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ProjectDelete,
        text: 'Correction d’un bug qui laissait la fiche, les créneaux et les tâches d’un bilan annuel après la suppression de son projet',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.meetings,
        permission: Permissions.MeetingRead,
        text: 'Correction d’un bug qui permettait de modifier d’autres champs que la date sur la fiche de réunion d’un bilan annuel',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug qui laissait la bulle de « Toute la journée » arriver en retard et rester coupée par le formulaire',
      },
    ],
    comments: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        text: 'Les bilans annuels et les modèles évitent de tout remplir à la main : un Responsable ouvre les créneaux, ses modérateurs réservent, et tout se retrouve dans « Réunions » et dans le calendrier.',
      },
    ],
  },
  {
    version: '0.6.2',
    date: '2026-10-21',
    title: 'Memora se peaufine',
    intro:
      'Les notifications, l’appel de présence et le détail d’un évènement gagnent en clarté, et les liens Memora s’affichent en carte dans Discord.',
    description:
      'Les notifications s’empilaient sans fin, la cloche passait inaperçue et l’appel de présence se lisait mal dans un détail d’évènement trop serré. Cette version range les notifications par pages, les met en avant avec une cloche qui sonne, redessine le détail d’un évènement et donne un vrai visuel aux liens partagés dans Discord.',
    items: [
      {
        tag: ChangelogTags.Added,
        page: ROUTES.notifications,
        text: 'Ajout d’un bouton « Marquer comme non lu » sur chaque notification déjà lue de la page « Notifications »',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une carte d’aperçu pour les liens Memora : une adresse collée dans Discord s’affiche avec un visuel et un titre au lieu d’un simple lien',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Ajout d’un lien court « memora.bazalthe.com/… » dans le détail d’un évènement posé, copié d’un clic pour revenir directement sur l’évènement',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.notifications,
        text: 'Ajout d’une cloche qui sonne quand une nouvelle notification arrive, avec une pastille rouge sur son coin tant qu’il en reste à lire',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.notifications,
        text: 'Amélioration de la page « Notifications » : dix notifications par page, avec les boutons « Précédent » et « Suivant » pour remonter plus loin',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.notifications,
        text: 'Amélioration de la boîte de notifications : les cinq dernières seulement, détachée de la page par une ombre et un fond assombri, avec un grand bouton « Tout voir » sur toute la largeur',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.notifications,
        text: 'Amélioration des notifications : toute la ligne s’ouvre d’un clic à la place du bouton « Voir », et le glyphe du type se pose sur le coin de l’avatar',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration visuelle de la cloche de notifications, redessinée en trois tons',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration du détail d’un évènement : une boîte « Informations » avec la date centrée (« Du 19 oct. 2026 de 02:12 au 06:12 »), puis son type, sa source, sa visibilité, son lien et son identifiant, avec de vrais glyphes en trois tons',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Amélioration de l’« Appel de présence » : affiché à droite du détail et ouvert d’office, avec Présents, Absents et Sans réponse dans trois boîtes colorées, les pseudos rangés par ordre alphabétique, trois par ligne',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration de « Ta présence » : le message devient « Tu as répondu présent(e) de 02:12 à 06:12 ! » avec les heures en gras, et « Je change d’avis » passe en petit texte dessous',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration de la grille du « Calendrier » : les évènements avec appel de présence sont plus grands et ne se réduisent plus à une seule ligne',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration des fiches de session et de candidat : tous les observateurs s’affichent en avatars, sans la bulle « +5 »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationWrite,
        text: 'Amélioration de la rédaction d’une annonce : le bouton de copie s’efface pendant l’écriture, la liste des @ et # s’ouvre au-dessus ou en dessous du caractère tapé avec une flèche, et les boîtes « Annonce » et « Aperçu » descendent jusqu’en bas du formulaire',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationWrite,
        text: 'Correction d’un clic sans effet sur les communications écrites dans Memora de la page « Communications » : un clic ouvre maintenant leur formulaire',
      },
    ],
  },
  {
    version: '0.6.1',
    date: '2026-10-20',
    title: 'Pas mal d’améliorations',
    intro:
      'Tu peux commenter les tâches et les projets, cocher une tâche d’un clic, et la Mod View propose des sanctions mieux choisies.',
    description:
      'Pour parler d’une tâche ou d’un projet, il fallait aller sur Discord. Cette version met la discussion et la case à cocher là où on travaille, ouvre toute seule les tâches et le projet d’un recrutement, et remet de l’ordre dans la fiche d’un YouTubeur et dans la liste des modérateurs.',
    items: [
      {
        tag: ChangelogTags.Improved,
        audience: ChangelogAudiences.Responsables,
        text: 'Amélioration globale de la gestion des rôles dans Memora',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Ajout du choix « Toute l’équipe » du YouTubeur dans la visibilité d’un évènement, avec son logo, juste sous « Tout Memora » (anciennement « Tout le monde »)',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.teams,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceRead,
        text: 'Ajout de l’équipe « Observateurs » activée d’office pour chaque YouTubeur, pour choisir qui assiste aux entretiens de recrutement',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Amélioration des listes d’équipes d’un évènement, rangées par YouTubeur avec son logo, et du champ « Membre concerné » devenu « Responsable »',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberUpdate,
        text: 'Amélioration du choix d’équipe dans la fiche d’un modérateur, rangé par YouTubeur avec son logo',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationWrite,
        text: 'Amélioration de la rédaction d’une annonce, dont les boutons d’enregistrement et d’annulation se réduisent à deux pastilles pour laisser toute la place au texte',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentRead,
        text: 'Amélioration des menus de fonctions, rangés par catégorie (Modération, Junior, Junior Responsable) puis par fonction principale et secondaire',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Correction d’un bug où les annonces déjà écrites n’apparaissaient pas dans « Communications »',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.recruitments,
        permission: Permissions.RecruitmentObserve,
        text: 'Correction d’un bug où « Recrutements » quittait la catégorie « Programmes » pour les Responsables',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CalendarManage,
        text: 'Amélioration du détail d’un évènement du « Calendrier » : son identifiant n’est plus visible que par les Admins',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.academy,
        permission: Permissions.AcademyRead,
        text: 'Amélioration de l’accès à « Academy » : les Référents l’ouvrent désormais depuis le menu',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarManage,
        text: 'Correction d’un bug où un Modérateur pouvait créer n’importe quel évènement dans le « Calendrier » : seuls les Responsables le peuvent, et les Référents ne planifient plus dans le « Calendrier » pour le moment',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug où un évènement « Toute la journée » s’enregistrait sur quelques heures, comme 5h à 7h, au lieu de couvrir la journée entière',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.dashboard,
        permission: Permissions.CalendarRead,
        text: 'Correction d’un bug où « Je serai là » et « Je ne serai pas là » répondaient « Cet élément n’existe plus » pour un appel de présence',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.dashboard,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.LiveLogRead,
        text: 'Correction d’un bug où « Tu as 1 bilan de live à voir » menait à une page en erreur : la carte n’apparaît plus que pour un bilan que tu peux ouvrir',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        permission: Permissions.TaskRead,
        text: 'Ajout de la possibilité de laisser un commentaire sur une tâche',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        permission: Permissions.ProjectRead,
        text: 'Ajout de la possibilité de laisser un commentaire sur un projet',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.meetings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MeetingContentRead,
        text: 'Ajout de la possibilité de laisser un commentaire sur une réunion',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.announcements,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.CommunicationRead,
        text: 'Ajout de la possibilité de commenter une annonce de la page « Communications »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.recruitments,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.RecruitmentCandidateWrite,
        text: 'Ajout de la possibilité de laisser un commentaire sur une session de « Recrutements », dans son aperçu',
      },
      {
        tag: ChangelogTags.Added,
        text: 'Ajout d’une alerte de mention : le commentaire qui te cite s’affiche en rose pastel jusqu’à ce que tu passes dessus ou que 10 secondes passent, et un « 1 » sur pastille rouge apparaît à côté de la page concernée dans le menu, avec un petit glyphe pour marquer le commentaire « comme non lu » et tout rallumer',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des mentions dans les commentaires : la liste des membres s’ouvre dès le « @ », avec leur portrait et leur division, et les noms à plusieurs mots sont repérés en entier',
      },
      {
        tag: ChangelogTags.Improved,
        text: 'Amélioration des notifications de mention : elles arrivent aussi depuis les commentaires des tâches, des projets et des réunions, avec une bulle « Untel t’a mentionné sur un commentaire ! » à côté de la page',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        permission: Permissions.TaskRead,
        text: 'Ajout d’une case à cocher devant chaque tâche, dans « Tâches » et dans la liste des tâches d’un projet, pour marquer comme faite une tâche qui nous est confiée',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        permission: Permissions.TaskRead,
        text: 'Ajout de l’état « Stand-by » pour les tâches, les projets et les réunions',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.tasks,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TaskRead,
        text: 'Ajout des tâches « SYSTÈME » : celles que demande un recrutement ou une promotion s’ouvrent et se ferment toutes seules, on peut seulement les cocher',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.projects,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ProjectRead,
        text: 'Ajout d’un projet « Recrutement et Academy », ouvert tout seul pour chaque recrutement avec ses responsables, ses étapes et les liens vers le recrutement et l’Academy',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.meetings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MeetingRead,
        text: 'Ajout de la possibilité de créer une réunion sans date, et de convoquer « L’administration entière »',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceRead,
        text: 'Ajout d’une nouvelle fiche pour les YouTubeurs : le logo et le nom sur la bannière du créateur, à gauche ses chaînes avec leur lien puis son administration, à droite ses équipes',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TeamManage,
        text: 'Ajout de la possibilité de choisir les équipes ouvertes sur un créateur et de placer chaque modérateur dans les siennes, depuis la fiche du YouTubeur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceManage,
        text: 'Ajout de la possibilité pour les Admins de changer le rôle d’un responsable depuis la fiche du YouTubeur',
      },
      {
        tag: ChangelogTags.Added,
        page: ROUTES.lives,
        permission: Permissions.LiveRead,
        text: 'Ajout du choix « Surveiller » dans le clic droit d’un message de la Mod View, pour mettre un viewer sous surveillance',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.lives,
        permission: Permissions.LiveModerate,
        text: 'Amélioration des suggestions de la Mod View : la sanction proposée suit la gravité du message et ce que le viewer a déjà reçu pendant le live, sans jamais redescendre d’un cran',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.dashboard,
        permission: Permissions.TaskRead,
        text: 'Amélioration de la page « Accueil » : un lien « Voir toutes tes tâches » apparaît quand elles sont trop nombreuses pour s’y afficher',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.tasks,
        permission: Permissions.TaskRead,
        text: 'Amélioration des tableaux « Tâches », « Projets » et « Réunions » : les colonnes masquées s’ouvrent et se ferment avec une animation et les filtres arrivent l’un après l’autre',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.calendar,
        permission: Permissions.CalendarRead,
        text: 'Amélioration de l’appel d’un live dans le « Calendrier » : les horaires passent sous le nom de chacun et l’encadrement n’y figure plus',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration de la page « Modérateurs » : chaque YouTubeur devient une bannière, fermée au départ, qui ouvre la liste de ses modérateurs',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.members,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.MemberRead,
        text: 'Amélioration des Juniors : chaque fonction a son propre glyphe, avec des couleurs plus vives',
      },
      {
        tag: ChangelogTags.Improved,
        page: ROUTES.projects,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ProjectUpdate,
        text: 'Amélioration de l’équipe d’un projet : le nombre de responsables n’est plus limité',
      },
      {
        tag: ChangelogTags.Improved,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.TaskDelete,
        text: 'Amélioration de la sélection multiple : les tâches et les projets créés par le système ne se suppriment plus, on peut seulement changer leur état',
      },
      {
        tag: ChangelogTags.Fixed,
        page: ROUTES.settings,
        audience: ChangelogAudiences.Responsables,
        permission: Permissions.ReferenceRead,
        text: 'Correction d’un oubli de droits : les responsables voient maintenant les YouTubeurs et gèrent leurs équipes, sans pouvoir modifier l’administration',
      },
    ],
  },
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
        text: 'Ajout d’une disposition de départ propre à chaque poste de la « Mod View » : Modérateur, Référent, Responsable et Admin, mémorisée séparément',
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
        text: 'Ajout des entretiens de référent, des entretiens de panel et des bilans de l’Academy dans le « Calendrier », avec le référent concerné',
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
        text: 'Correction d’un bug qui privait les Référents de leurs accès initiaux',
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
        text: 'Amélioration des droits des modérateurs : ils consultent leurs « Tâches » sans pouvoir les modifier, et les pages « Formations » et « Recrutement » restent aux référents et recruteurs',
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
