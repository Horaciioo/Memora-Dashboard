/**
 * Wording of what Twitch reports
 * @type {{ twitch: string, blockedTerm: string, modeActions: Record<string, string>, automodCategories: Record<string, string> }}
 */

export const TWITCH_EVENT_COPY: {
  twitch: string
  blockedTerm: string
  modeActions: Record<string, string>
  automodCategories: Record<string, string>
} = {
  twitch: 'Twitch',
  blockedTerm: 'Terme bloqué',
  modeActions: {
    slow: 'Mode lent activé',
    slowoff: 'Mode lent coupé',
    followers: 'Réservé aux followers',
    followersoff: 'Ouvert à tous',
    subscribers: 'Réservé aux abonnés',
    subscribersoff: 'Ouvert aux non-abonnés',
    emoteonly: 'Émoticônes uniquement',
    emoteonlyoff: 'Émoticônes uniquement coupé',
  },
  automodCategories: {
    aggression: 'Agressivité',
    bullying: 'Harcèlement',
    disability: 'Handicap',
    sexuality: 'Sexualité',
    misogyny: 'Misogynie',
    race_ethnicity_or_religion: 'Origine ou religion',
    sex_based_terms: 'Termes sexuels',
    swearing: 'Grossièretés',
  },
}

/**
 * How an account is named in the Accounts section
 * @type {Record<string, string>}
 */

export const ACCOUNT_NAME_COPY = {
  discord: '{username} ({id})',
} as const

/**
 * Copy of the platform accounts in the settings
 * @type {Record<string, string>}
 */

export const PLATFORM_ACCOUNT_COPY = {
  title: 'Comptes',
  lead: 'Les comptes liés à ton profil. La Mod View agit sur Twitch avec ton propre compte de modérateur : tes accès restent chiffrés et ne quittent jamais le serveur.',
  add: 'Ajouter une liaison',
  relink: 'Reconnecter',
  unlink: 'Délier',
  revoked: 'Accès expiré, à reconnecter',
  unconfigured: '{platform}, pas configuré',
  unlinkConfirm:
    'Délier ton compte {platform} ? Memora ne pourra plus agir avec lui tant que tu ne l’auras pas relié de nouveau.',
  linked: '{platform} est lié à ton profil',
  unlinked: '{platform} n’est plus lié à ton profil',
  failed: 'La liaison avec {platform} a échoué, réessaie',
} as const

/**
 * What the Mod View says when Twitch is out of reach
 * @type {Record<string, string>}
 */

export const PLATFORM_NOTICE_COPY = {
  notLinked: 'Lie ton compte Twitch dans Paramètres pour modérer depuis Memora.',
  revoked: 'Ton accès Twitch a expiré : reconnecte-le dans Paramètres.',
  notModerator: 'Ton compte Twitch n’est pas modérateur de cette chaîne : lecture seule.',
  noChannel: 'La chaîne Twitch de ce créateur n’est pas encore renseignée.',
  severalChannels:
    'Ce créateur a plusieurs chaînes Twitch : la modération depuis Memora attend le choix de la chaîne du live.',
  notConfigured: 'La liaison Twitch n’est pas encore configurée sur ce serveur.',
  waiting: 'En attente du lancement du live sur Twitch.',
  reconnecting: 'Connexion à Twitch perdue, reconnexion…',
} as const

/**
 * Twitch refusals
 * @type {Record<string, string>}
 */

export const PLATFORM_ERROR_COPY = {
  unauthorized: 'Twitch a refusé ton accès : reconnecte ton compte dans Paramètres.',
  forbidden: 'Ton compte Twitch n’a pas le droit de faire cette action de Mod. sur cette chaîne.',
  notFound: 'Ce message ou cet utilisateur n’existe plus sur Twitch.',
  conflict: 'C’est déjà fait sur Twitch.',
  rateLimited: 'Trop de actions de Mod. d’un coup : Twitch demande d’attendre quelques secondes.',
  unavailable: 'Twitch ne répond pas pour l’instant, réessaie dans un instant.',
  unsupported: 'Twitch ne permet pas cette action de Mod. depuis une application.',
  invalid: 'Twitch a refusé cette action de Mod.',
} as const

/**
 * Copy of a creator's channels
 * @type {Record<string, string>}
 */

export const CHANNEL_COPY = {
  title: 'Chaînes',
  lead: 'La Mod View et la détection du lancement des lives s’appuient sur ces chaînes.',
  twitch: 'Twitch',
  youtube: 'YouTube',
  add: 'Ajouter une chaîne',
  platform: 'Plateforme',
  channel: 'Identifiant',
  channelInfo: 'Seulement l’identifiant de la chaîne, sans le début du lien.',
  channelPlaceholder: 'inoxtag',
  empty: 'Aucune chaîne',
  remove: 'Retirer la chaîne',
  saved: 'Chaîne enregistrée',
  removed: 'Chaîne retirée',
  invalidYoutube: 'Ce n’est pas une chaîne YouTube valide.',
  unknown: 'Aucune chaîne Twitch ne porte ce login.',
  taken: 'Cette chaîne est déjà rattachée à un autre créateur.',
  notConfigured: 'La liaison Twitch n’est pas encore configurée sur ce serveur.',
} as const
