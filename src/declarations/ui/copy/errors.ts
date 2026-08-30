/**
 * Error boundary copy
 * @type {Record<string, string>}
 */

export const ERROR_PAGE_COPY = {
  title: 'Quelque chose a cassé',
  description: 'L’erreur a été signalée. Réessaie, ou reviens au tableau de bord.',
  retry: 'Réessayer',
  home: 'Retour au tableau de bord',
  reference: 'Référence',
  notFoundTitle: 'Page introuvable',
  notFoundDescription: 'Ce lien ne mène nulle part, ou la page a été déplacée.',
  criticalTitle: 'Memora ne répond plus',
  criticalDescription: 'Recharge la page. Si ça persiste, préviens un responsable.',
  reload: 'Recharger',
} as const
