/**
 * Copy of the maturity tag and its explainer page
 * @type {Record<string, string | ((percent: number) => string)>}
 */

export const MATURITY_COPY = {
  pageTitle: 'Tags de développement',
  pageLead: 'Ce que chaque étiquette dit de l’état d’avancement d’une fonctionnalité.',
  tagHint: 'Comprendre les niveaux de maturité',
  understood: 'J’ai compris !',
  progress: (percent: number) => `(${percent}%)`,
} as const
