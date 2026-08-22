/**
 * Sign-in screen copy
 * @type {Record<string, string>}
 */

export const AUTH_COPY = {
  title: 'Connexion',
  subtitle: 'Entre ton identifiant Discord pour rejoindre ton espace.',
  field: 'Identifiant Discord',
  placeholder: '000000000000000000',
  hint: 'Clic droit sur ton profil Discord puis « Copier l’identifiant ».',
  submit: 'Entrer',
  pending: 'Connexion…',
  malformedId: 'Un identifiant Discord ne contient que des chiffres.',
  unknownId: 'Cet identifiant n’est rattaché à aucun compte.',
  revokedAccess: 'Ton accès a été révoqué.',
  signedIn: 'Connexion au dashboard',
  signOut: 'Se déconnecter',
  missingRoot: 'ADMIN_DISCORD_ID n’est pas renseigné dans le .env.',
} as const
