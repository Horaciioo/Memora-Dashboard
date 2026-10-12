/**
 * Error boundary copy
 * @type {Record<string, string>}
 */

export const ERROR_PAGE_COPY = {
  // Giant words
  errorWord: 'Oups',
  notFoundWord: '404',
  title: 'Aïe ! Quelque chose s’est mal passé !',
  description: 'Le développeur a été prévenu. Réessaie, ou retourne en arrière.',
  retry: 'Réessayer',
  loadFailedTitle: 'Impossible de charger cette partie',
  loadFailedHint: 'Vérifie ta connexion puis réessaie.',
  home: 'Retour à l’accueil',
  reference: 'Référence',
  forbiddenWord: '403',
  forbiddenTitle: 'Bah alors... On s’aventure là où on n’a pas le droit ? 👀',
  forbiddenDescription: 'Désolé, mais va falloir retourner en arrière darling...',
  forbiddenHome: 'Retourner à l’accueil',
  notFoundTitle: 'Page introuvable',
  notFoundDescription: 'Ce lien ne sembler mener nulle part, ou la page a été déplacée.',
  criticalTitle: 'Memora ne répond plus, il est parti faire une petite sieste...',
  criticalDescription: 'Recharge la page. Si ça persiste, préviens un responsable.',
  reload: 'Recharger',
} as const
