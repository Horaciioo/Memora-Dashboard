/**
 * Error boundary copy
 * @type {Record<string, string>}
 */

export const ERROR_PAGE_COPY = {
  title: 'Un pépin est survenu',
  description: 'L’erreur a été signalée. Réessaie, ou reviens à l’accueil.',
  retry: 'Réessayer',
  home: 'Retour à l’accueil',
  reference: 'Référence',
  notFoundTitle: 'Page introuvable',
  notFoundDescription: 'Ce lien ne mène nulle part, ou la page a été déplacée.',
  criticalTitle: 'Memora ne répond plus',
  criticalDescription: 'Recharge la page. Si ça persiste, préviens un responsable.',
  reload: 'Recharger',
} as const
