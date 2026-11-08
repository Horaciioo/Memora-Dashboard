/**
 * Query key a refused link comes back with
 * @type {string}
 */

export const WELCOME_ERROR_PARAM = 'error'

/**
 * Value of that query for a refused identity
 * @type {string}
 */

export const WELCOME_REFUSED = 'refused'

/**
 * Query a refused link comes back with
 * @type {string}
 */

export const WELCOME_REFUSED_QUERY = `${WELCOME_ERROR_PARAM}=${WELCOME_REFUSED}`

/**
 * What Memora says to a candidate whose Discord account she checks
 * @type {Record<string, string | string[]>}
 */

export const WELCOME_COPY = {
  title: 'Bienvenue sur Memora',
  chatLabel: 'Conversation avec Memora',
  tabTitle: 'Vérification',
  hello: 'Salut {name} ! Je suis Memora.',
  search: 'Je regarde ta candidature dans mes dossiers.',
  found:
    "Voici le compte qui t'est associé parmi les candidats acceptés. C’est bien ton compte Discord ?",
  yes: 'Oui, c’est moi',
  no: 'Ce n’est pas moi',
  checking: 'Je vérifie, une seconde.',
  // The animated confirmation
  welcome: 'Bienvenue dans la Session {session} !',
  welcomeSub: 'Je t’emmène à l’intérieur.',
  unknown: [
    'Je ne trouve aucune candidature acceptée liée à ce compte Discord.',
    'Pas de panique, on va régler ça ensemble.',
  ],
  // After a refused account
  pseudo: 'Très bien, dans ce cas quel est ton pseudo ?',
  // For an account nobody matches
  pseudoFirst: 'Quel est ton pseudo ?',
  pseudoRetry:
    'Hmm, je ne le retrouve pas. Écris-le moi autrement, comme tu l’avais donné à ta candidature.',
  pseudoPlaceholder: 'Ton pseudo',
  send: 'Envoyer',
  escalated: [
    'Je préviens un Responsable.',
    'Une fois qu’il aura entré le bon identifiant, il te régénèrera un nouveau lien, qui te permettra alors de continuer sereinement.',
    'Tu peux d’ores et déjà me fermer.',
  ],
  // Link a responsable handed out
  linkHello:
    'Salut ! Je suis Memora. Ton Responsable m’a donné ton identifiant, il ne reste qu’à te connecter.',
  connect: 'Me connecter avec Discord',
  linkRefused:
    'Ce lien est réservé à un autre compte Discord. Reconnecte-toi avec celui que ton Responsable a renseigné.',
  linkDead: 'Ce lien n’est plus valable. Demande à ton Responsable d’en générer un nouveau.',
  gone: 'Cette vérification a expiré. Reconnecte-toi avec Discord pour la reprendre.',
  back: 'Revenir à la connexion',
  failed: 'Je n’ai pas réussi, réessaie dans un instant.',
} as const

/**
 * Words of the server side of an identity check
 * @type {Record<string, string>}
 */

export const IDENTITY_COPY = {
  unnamed: 'Candidat sans pseudo',
  nameRequired: 'Écris ton pseudo.',
  idInvalid: 'Un identifiant Discord compte entre 17 et 20 chiffres.',
} as const
