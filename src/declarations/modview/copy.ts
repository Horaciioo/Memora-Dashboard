/**
 * Copy of the Mod View
 * @type {Record<string, string>}
 */

export const MODVIEW_COPY = {
  stream: 'Flux',
  modActions: 'Actions de modérateur',
  automod: 'File d’attente de l’AutoMod',
  chat: 'Chat',
  community: 'Communauté',
  unbanRequests: 'Demandes de débannissement',
  sanctions: 'Panel de sanctions',
  windows: 'Fenêtres',
  back: 'Retourner à l’Accueil',
  leaveTitle: 'Tu t’arrêtes là ?',
  leaveLead: 'Si tu continues, ton temps de modération reste compté.',
  leaveStop: 'Oui, j’arrête de modérer',
  leaveKeep: 'Non, je continue',
  settings: 'Paramètres',
  sidebar: 'Navigation de la Mod View',
  sanctionsEmpty: 'Aucun panel de sanctions pour ce YouTubeur et cette plateforme.',
  filter: 'Filtre',
  options: 'Options',
  collapse: 'Replier',
  expand: 'Déplier',
  modes: 'Modes',
  blockedTerms: 'Termes bloqués',
  allowedTerms: 'Termes autorisés',
  termPlaceholder: 'Ajouter un terme',
  termAdd: 'Ajouter',
  termRemove: 'Retirer {term}',
  termsEmpty: 'Aucun terme.',
  resume: 'Reprendre le défilement',
  paused: 'Chat en pause',
  frozen: 'Chat figé, relâche Alt pour reprendre',
  quickWarn: 'Avertir',
  warnTitle: 'La raison ?',
  warnLead: 'Avertissement envoyé à {name}.',
  warnPlaceholder: 'Écris la raison de l’avertissement',
  warnConfirm: 'Avertir',
  reply: 'Répondre',
  replyTo: 'Réponse à {name}',
  replyCancel: 'Annuler la réponse',
  replyingTo: 'En réponse à {name}',
  pin: 'Épingler le message',
  unpin: 'Désépingler',
  pinned: 'Message épinglé',
  pinnedBy: 'par {name}',
  viewers: 'Spectateurs',
  commandsTitle: 'Commandes',
  mentionsTitle: 'Derniers à avoir écrit',
  quickDelete: 'Supprimer le message',
  quickTimeout: 'Exclure 10 minutes',
  quickBan: 'Bannir',
  chatOptions: 'Affichage du chat',
  slowOff: 'Aucun',
  followersOff: 'Aucun',
  shieldAsk: 'Activer le mode bouclier ?',
  shieldAskBody:
    'Le mode bouclier applique les protections de crise de la chaîne : tout le chat est durci d’un coup.',
  shieldAskConfirm: 'Continuer',
  shieldSure: 'Tu en es vraiment sûr ?',
  shieldSureBody:
    'Dernière validation. Tous les viewers le ressentent tout de suite, et seuls Jérémy ou les Responsables pourront le couper.',
  shieldSureConfirm: 'Oui, activer le bouclier',
  emotes: 'Émoticônes',
  emotesSearch: 'Chercher une émoticône',
  emotesChannel: 'De la chaîne',
  emotesGlobal: 'De Twitch',
  emotesNone: 'Aucune émoticône trouvée.',
  emotesUnavailable: 'Les émoticônes de Twitch ne sont pas joignables pour l’instant.',
  emojis: 'Emojis',
  tags: 'Tags du live',
  emoteLockedSub: 'Réservée aux abonnés',
  emoteLockedBits: 'Débloquée avec des bits',
  emoteLockedFollower: 'Réservée aux followers',
  emotesUnverified:
    'Memora ne peut pas vérifier tes abonnements : relie de nouveau ton compte Twitch pour griser les émoticônes que tu ne peux pas utiliser.',
  emotesOpen: 'Émoticônes et emojis',
  preferences: 'Préférences',
  preferencesDisplay: 'Affichage',
  preferencesPause: 'Mettre le chat en pause',
  preferencesTools: 'Icônes de modération',
  keepResolved: 'Garder les messages traités',
  keepResolvedHint: 'Un message accepté ou refusé reste dans la file, marqué comme résolu.',
  dropResolved: 'Retirer les messages traités',
  dropResolvedHint: 'Un message accepté ou refusé disparaît dès que tu agis.',
  resolvedApproved: 'Accepté par {name}',
  resolvedDenied: 'Refusé par {name}',
  resolved: 'Résolu',
  messagesSent: 'Messages envoyés dans le chat',
  pageOf: 'Page {page} sur {total}',
  pagePrevious: 'Page précédente',
  pageNext: 'Page suivante',
  welcome: 'Bienvenue sur le chat de {channel} !',
  firstMessage: 'Message envoyé pour la 1ère fois',
  deletedBy: '{name} a supprimé ce message.',
  deletedVerb: 'a supprimé',
  placeholder: 'Envoyer un message',
  commandsOnly: 'Commandes seulement : /timeout, /ban, /warn, /unban',
  placeholderCrisis: 'Livecon 1 : seul l’Admin parle dans le chat.',
  send: 'Chat',
  automodEmptyTitle: 'Prêt pour les messages bloqués',
  automodEmptyBody: 'Les messages retenus par l’AutoMod s’afficheront ici.',
  unbanEmptyTitle: 'Aucune demande en attente',
  unbanEmptyBody: 'Les demandes de débannissement arrivent ici.',
  actsEmptyTitle: 'Aucune action pour l’instant',
  actsEmptyBody: 'Chaque action de Mod. de l’équipe s’inscrit ici, le plus récent en haut.',
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
  statMessages: 'Messages envoyés',
  statTotal: 'Sanctions au total',
  statLive: 'Sanctions sur ce live',
  openTwitch: 'Ouvrir sur Twitch',
  messagesEmpty: 'Aucun message sur ce live.',
  commentField: 'Commentaire',
  loginField: 'Pseudo Twitch',
  commentPlaceholder: 'Écrire un commentaire sur ce viewer',
  commentSend: 'Ajouter le commentaire',
  commentsEmpty: 'Aucun commentaire sur ce viewer.',
  tabDossier: 'Dossier',
  tabComments: 'Commentaires',
  tabSanctions: 'Sanctions à mettre',
  customDuration: 'Durée libre : 90s, 15m, 2h, 3d, 2w',
  customApply: 'Exclure',
  deleteMessage: 'Supprimer ce message',
  close: 'Fermer la fiche',
  messages: 'Messages envoyés dans le chat',
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
  self: 'Tu ne peux pas agir sur toi-même ni sur la chaîne.',
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
 * Spent times
 * @type {Record<string, string>}
 */

export const MODVIEW_SPAN_COPY = {
  hours: '{hours} h {minutes}',
  minutes: '{minutes} min',
  seconds: '{seconds} s',
  underMinute: '<1 minute',
  unitHour: 'h',
  unitMinute: 'min',
  unitSecond: 's',
} as const

/**
 * Why a chat line was not sent
 * @type {Record<string, string>}
 */

export const MODVIEW_COMMAND_COPY = {
  unknownCommand: 'Commande inconnue. Tape / pour voir les commandes.',
  unknownUser: 'Ce viewer n’est pas dans le chat de ce live.',
  badDuration: 'Durée illisible : écris 600, 10m, 1h ou 1d.',
  missingUser: 'Précise le viewer après la commande.',
  refused: 'Cette action de Mod. t’est grisée : {reason}',
} as const

/**
 * Copy of the sanctions panel
 * @type {Record<string, string>}
 */

export const MODVIEW_PANEL_COPY = {
  search: 'Rechercher une infraction',
  emptySearch: 'Aucune infraction ne correspond.',
  closeRail: 'Fermer',
  rung: 'Palier {n}',
  rungOf: 'Palier {n} sur {total}',
  next: 'Palier suivant',
  third: 'Palier 3',
  prefill: 'Pré-écrire pour {name}',
  noGesture: 'Ce palier ne porte aucune action de Mod. à envoyer : applique-le à la main.',
  pickTarget: 'Choisis un viewer dans le chat pour pré-écrire une sanction.',
} as const

/**
 * Copy of the history view that replaces the connected list
 * @type {Record<string, string>}
 */

export const MODVIEW_HISTORY_COPY = {
  sanctionsTitle: 'Historique des sanctions',
  empty: 'Aucun viewer sanctionné pour l’instant.',
  past: 'Sanctions passées',
  pastEmpty: 'Aucune sanction passée sur cette chaîne.',
  pastLoading: 'Chargement de l’historique',
  propose: 'Suite : {offense}, palier {n}',
  fromPanel: 'Panel',
  offPanel: 'Hors panel',
  by: 'par {name}',
} as const

/**
 * Copy of Inspect Mod and Focus mode
 * @type {Record<string, string>}
 */

export const MODVIEW_INSPECT_COPY = {
  title: 'Inspect Mod',
  tabTeam: 'Modérateurs',
  close: 'Fermer',
  attendance: 'Présence déclarée',
  noAnswer: 'Pas de réponse',
  absent: 'En absence en ce moment',
  active: 'Temps actif dans la Mod View',
  gestures: 'Dernières sanctions',
  gesturesEmpty: 'Aucune action de Mod. sur ce live.',
  onBehalf: 'pour {name}',
  following: 'Focus : {name}',
  focusTag: 'Focus',
  emptyTitle: 'Choisis un modérateur',
  emptyBody:
    'Les modérateurs connectés apparaissent ici, clique sur l’un d’eux pour voir ce qu’il fait.',
  nobody: 'Aucun autre modérateur n’est connecté.',
  back: 'Revenir à la liste',
  actInPlace: 'Agir à sa place',
  actInPlaceHint: 'Tes actions de Mod. partent avec ton compte et sont notés « pour {name} ».',
  stop: 'Arrêter le Focus',
  started: 'Focus lancé',
  stopped: 'Focus arrêté',
} as const

/**
 * Copy of the unban requests desk, as Twitch words it
 * @type {Record<string, string>}
 */

export const MODVIEW_UNBAN_COPY = {
  title: 'Demandes d’annulation de bannissement',
  count: '{count} demandes',
  countOne: '1 demande',
  sort: 'Trier les demandes',
  sortRecent: 'Plus récentes',
  sortOld: 'Plus anciennes',
  expand: 'Agrandir',
  back: 'Revenir à la Mod View',
  range: '{from}-{to} sur {total}',
  previous: 'Page précédente',
  next: 'Page suivante',
  empty: 'Aucune demande en attente.',
  pick: 'Choisis une demande dans la liste.',
  accountCreated: 'Compte créé le {date}',
  bannedBy: 'Banni(e) par',
  bannedOn: 'Banni(e) le',
  bans: 'Bannissements',
  timeouts: 'Bannissements temporaires',
  tabLogs: 'Journaux du chat ({n})',
  tabComments: 'Commentaires de modérateur ({n})',
  logsEmpty: 'Aucun message de ce viewer dans le chat de ce live.',
  commentsEmpty: 'Aucun commentaire sur ce viewer.',
  reject: 'Rejeter la demande',
  accept: 'Accepter la demande',
  none: '–',
} as const
