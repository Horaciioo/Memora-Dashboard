/**
 * Sign-in screen copy
 * @type {Record<string, string>}
 */

export const AUTH_COPY = {
  title: 'Connexion',
  subtitle: 'Identifie-toi pour rejoindre le dashboard.',
  field: 'Ton identifiant Discord',
  hint: 'Clic droit sur ton profil Discord, puis « Copier l’identifiant ».',
  placeholder: '000000000000000000',
  submit: 'Entrer',
  pending: 'Connexion…',
  malformedId: 'Un identifiant Discord ne contient que des chiffres.',
  unknownId: 'Cet identifiant n’est rattaché à aucun compte.',
  revokedAccess: 'Ton accès a été révoqué.',
  signedIn: 'Connexion au dashboard',
  signOut: 'Se déconnecter',
  discordSubmit: 'Continuer avec Discord',
  discordPending: 'Redirection…',
  discordOffline: 'La connexion Discord n’est pas encore configurée.',
  discordRefused: 'Discord a refusé la connexion. Réessaie.',
  discordExpired: 'La demande a expiré. Relance la connexion.',
  identifierDisabled: 'La connexion par identifiant est désactivée sur cet environnement.',
  fallbackNotice: 'Connexion de développement, en attendant Discord.',
  throttled: 'Trop de tentatives. Patiente quelques minutes.',
  broken: 'La connexion a échoué. Réessaie dans un instant.',
  privacyLink: 'Comment tes données sont traitées',
} as const
