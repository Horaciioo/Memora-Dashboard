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
