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
 * Copy of the platform accounts in the settings
 * @type {Record<string, string>}
 */

export const PLATFORM_ACCOUNT_COPY = {
  title: 'Comptes de plateforme',
  lead: 'La Mod View agit sur Twitch avec ton propre compte de modérateur. Tes accès restent chiffrés et ne quittent jamais le serveur.',
  twitch: 'Twitch',
  link: 'Lier mon compte Twitch',
  relink: 'Reconnecter Twitch',
  unlink: 'Délier',
  linkedAs: 'Lié à {login}',
  notLinked: 'Aucun compte lié',
  revoked: 'Accès expiré, à reconnecter',
  unavailable: 'La liaison Twitch n’est pas encore configurée sur ce serveur.',
  unlinkConfirm: 'Délier ton compte Twitch ? La Mod View passera en lecture seule pour toi.',
  linked: 'Compte Twitch lié',
  unlinked: 'Compte Twitch délié',
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
  notConfigured: 'La liaison Twitch n’est pas encore configurée sur ce serveur.',
  waiting: 'En attente du lancement du live sur Twitch.',
  reconnecting: 'Connexion à Twitch perdue, reconnexion…',
} as const

/**
 * Twitch refusals, in French
 * @type {Record<string, string>}
 */

export const PLATFORM_ERROR_COPY = {
  unauthorized: 'Twitch a refusé ton accès : reconnecte ton compte dans Paramètres.',
  forbidden: 'Ton compte Twitch n’a pas le droit de faire ce geste sur cette chaîne.',
  notFound: 'Ce message ou cet utilisateur n’existe plus sur Twitch.',
  conflict: 'C’est déjà fait sur Twitch.',
  rateLimited: 'Trop de gestes d’un coup : Twitch demande d’attendre quelques secondes.',
  unavailable: 'Twitch ne répond pas pour l’instant, réessaie dans un instant.',
  unsupported: 'Twitch ne permet pas ce geste depuis une application.',
  invalid: 'Twitch a refusé ce geste.',
} as const

/**
 * Copy of a creator's channels
 * @type {Record<string, string>}
 */

export const CHANNEL_COPY = {
  title: 'Chaînes',
  lead: 'La Mod View et la détection du lancement des lives s’appuient sur ces chaînes.',
  twitch: 'Twitch',
  placeholder: 'Login de la chaîne',
  saved: 'Chaîne enregistrée',
  unknown: 'Aucune chaîne Twitch ne porte ce login.',
  taken: 'Cette chaîne est déjà rattachée à un autre créateur.',
  notConfigured: 'La liaison Twitch n’est pas encore configurée sur ce serveur.',
} as const
