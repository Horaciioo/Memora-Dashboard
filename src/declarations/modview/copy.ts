/**
 * Copy of the Mod View
 * @type {Record<string, string>}
 */

export const MODVIEW_COPY = {
  stream: 'Flux',
  latestVideo: 'Vidéo la plus récente',
  modActions: 'Actions de modérateur',
  automod: 'File d’attente de l’AutoMod',
  chat: 'Chat',
  community: 'Communauté',
  unbanRequests: 'Demandes de débannissement',
  sanctions: 'Panel de sanctions',
  windows: 'Fenêtres',
  back: 'Live en cours',
  sanctionsOpen: 'Ouvrir le panel de sanctions',
  sanctionsClose: 'Replier le panel de sanctions',
  sanctionsEmpty: 'Aucun panel de sanctions pour ce YouTubeur et cette plateforme.',
  filter: 'Filtre',
  options: 'Options',
  collapse: 'Replier',
  expand: 'Déplier',
  modes: 'Modes',
  modeOn: 'Activé',
  modeOff: 'Coupé',
  blockedTerms: 'Termes bloqués',
  allowedTerms: 'Termes autorisés',
  termPlaceholder: 'Ajouter un terme',
  termAdd: 'Ajouter',
  termRemove: 'Retirer {term}',
  termsEmpty: 'Aucun terme.',
  resume: 'Reprendre le défilement',
  quickDelete: 'Supprimer le message',
  quickTimeout: 'Exclure 10 minutes',
  quickBan: 'Bannir',
  chatOptions: 'Affichage du chat',
  welcome: 'Bienvenue sur le chat de {channel} !',
  firstMessage: 'Premier message',
  deletedBy: 'Un modérateur a supprimé ce message.',
  placeholder: 'Envoyer un message',
  commandsOnly: 'Commandes seulement : /timeout, /ban, /warn, /unban',
  placeholderCrisis: 'Livecon 1 : seul l’Admin parle dans le chat.',
  send: 'Chat',
  automodEmptyTitle: 'Prêt pour les messages bloqués',
  automodEmptyBody: 'Les messages retenus par l’AutoMod s’afficheront ici.',
  unbanEmptyTitle: 'Aucune demande en attente',
  unbanEmptyBody: 'Les demandes de débannissement arrivent ici.',
  actsEmptyTitle: 'Aucune action pour l’instant',
  actsEmptyBody: 'Chaque geste de l’équipe s’inscrit ici, le plus récent en haut.',
  approve: 'Accepter',
  deny: 'Refuser',
  connected: 'Connecté',
  connecting: 'Connexion…',
  disconnected: 'Déconnecté(e)',
  scripted: 'Scène de formation',
  noEmbed: 'Le flux apparaît ici dès que la chaîne est en direct.',
  searchCommunity: 'Filtre',
  refresh: 'Rafraîchir',
  ago: 'il y a {time}',
  by: 'par',
  during: 'pendant',
  pending: 'en attente de la plateforme',
} as const

/**
 * Sentences of the moderator actions window
 * @type {Record<string, string>}
 */

export const MODVIEW_ACT_COPY = {
  delete: 'Message supprimé par',
  warn: 'Averti par',
  timeout: 'Banni temporairement par',
  ban: 'Banni par',
  unban: 'Débanni par',
  automodApprove: 'Message accepté par',
  automodDeny: 'Message refusé par',
  termAdd: 'Terme bloqué ajouté par',
  termRemove: 'Terme bloqué retiré par',
  mode: 'Mode changé par',
  unbanRequest: 'Demande traitée par',
} as const

/**
 * Labels of the user card
 * @type {Record<string, string>}
 */

export const MODVIEW_USER_COPY = {
  title: 'Fiche du viewer',
  close: 'Fermer la fiche',
  messages: 'Messages sur ce live',
  history: 'Sanctions passées',
  historyEmpty: 'Aucune sanction dans Memora.',
  delete: 'Supprimer',
  warn: 'Avertir',
  timeout: 'Exclure',
  ban: 'Bannir',
  unban: 'Débannir',
  reason: 'Motif',
  reasonPlaceholder: 'Motif gardé dans l’historique',
  apply: 'Appliquer à {name}',
  pickTarget: 'Choisis un viewer dans le chat pour appliquer une mesure.',
} as const

/**
 * Why a control is greyed
 * @type {Record<string, string>}
 */

export const MODVIEW_LOCK_COPY = {
  role: 'Réservé à {who}.',
  crisis: 'Désactivé en Livecon 1 : seul l’Admin parle publiquement.',
  platform: 'Indisponible sur cette plateforme.',
  offline: 'La Mod View n’est pas connectée à la plateforme.',
} as const

/**
 * Timeout lengths in words
 * @type {Record<string, string>}
 */

export const MODVIEW_DURATION_COPY = {
  seconds: '{count} s',
  minutes: '{count} min',
  hours: '{count} h',
  days: '{count} j',
} as const

/**
 * Spent times, as reports say them
 * @type {Record<string, string>}
 */

export const MODVIEW_SPAN_COPY = {
  hours: '{hours} h {minutes}',
  minutes: '{minutes} min',
  seconds: '{seconds} s',
} as const

/**
 * Why a chat line was not sent
 * @type {Record<string, string>}
 */

export const MODVIEW_COMMAND_COPY = {
  unknownCommand: 'Commande inconnue. Commandes possibles : /timeout, /ban, /warn, /unban.',
  unknownUser: 'Ce viewer n’est pas dans le chat de ce live.',
  badDuration: 'Durée illisible : écris 600, 10m, 1h ou 1d.',
  missingUser: 'Précise le viewer après la commande.',
  refused: 'Ce geste t’est grisé : {reason}',
} as const

/**
 * Copy of the sanctions panel, second version
 * @type {Record<string, string>}
 */

export const MODVIEW_PANEL_COPY = {
  search: 'Rechercher une infraction',
  favorites: 'Favoris',
  recents: 'Récents',
  all: 'Total panel',
  favorite: 'Épingler en favori',
  unfavorite: 'Retirer des favoris',
  emptyFavorites: 'Aucun favori. Épingle une infraction avec l’étoile.',
  emptyRecents: 'Aucune infraction appliquée pendant ce live.',
  emptySearch: 'Aucune infraction ne correspond.',
  rung: 'Palier {n}',
  rungOf: 'Palier {n} sur {total}',
  next: 'Palier suivant',
  third: 'Palier 3',
  prefill: 'Pré-écrire pour {name}',
  noGesture: 'Ce palier ne porte aucun geste à envoyer : applique-le à la main.',
  pickTarget: 'Choisis un viewer dans le chat pour pré-écrire une sanction.',
} as const

/**
 * Copy of the history view that replaces the connected list
 * @type {Record<string, string>}
 */

export const MODVIEW_HISTORY_COPY = {
  title: 'Historique',
  sanctioned: 'Sanctionnés pendant ce live',
  empty: 'Aucun viewer sanctionné pour l’instant.',
  past: 'Sanctions passées',
  pastEmpty: 'Aucune sanction passée sur cette chaîne.',
  pastLoading: 'Chargement de l’historique',
  propose: 'Suite : {offense}, palier {n}',
  fromPanel: 'Panel',
  offPanel: 'Hors panel',
  by: 'par {name}',
  team: 'Équipe du live',
  inspect: 'Inspect Mod',
  focus: 'Focus',
  connected: 'Connectés',
  focusOpen: 'Focus en cours',
  focusBy: '{watcher} suit {target}',
} as const

/**
 * Copy of Inspect Mod and Focus mode
 * @type {Record<string, string>}
 */

export const MODVIEW_INSPECT_COPY = {
  title: 'Inspect Mod',
  close: 'Fermer',
  attendance: 'Présence déclarée',
  noAnswer: 'Pas de réponse',
  absent: 'En absence en ce moment',
  active: 'Temps actif dans la Mod View',
  gestures: 'Dernières sanctions',
  gesturesEmpty: 'Aucun geste sur ce live.',
  onBehalf: 'pour {name}',
  following: 'Tu suis {name}',
  followingHint: 'Ses gestes s’allument dans les actions de modérateur.',
  actInPlace: 'Agir à sa place',
  actInPlaceHint: 'Tes gestes partent avec ton compte et sont notés « pour {name} ».',
  stop: 'Arrêter le Focus',
  started: 'Focus lancé',
  stopped: 'Focus arrêté',
} as const
