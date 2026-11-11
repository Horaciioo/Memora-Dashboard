/**
 * Integration period not validated
 * @type {Record<string, string>}
 */

export const DERANK_PERIODS = {
  first: 'Première',
  second: 'Seconde',
} as const

export type DerankPeriodName = keyof typeof DERANK_PERIODS

/**
 * Function names as the announcement writes them
 * @type {Readonly<Record<string, string>>}
 */

export const DERANK_FUNCTIONS: Readonly<Record<string, string>> = {
  Lives: 'Modérateurs Lives',
  Discord: 'Modérateurs Discord',
}

/**
 * Wording of the derank announcement, singular and plural
 * @type {Record<string, string>}
 */

export const DERANK_WORDS = {
  title: 'Départ de {names}',
  joiner: ' & ',
  // A period not validated
  failedOne: 'n’a pas validé sa {period} Période d’Intégration et a donc été destitué·e',
  failedMany: 'n’ont pas validé leur {period} Période d’Intégration et ont donc été destitué·e·s',
  periodJoiner: ' ou ',
  // Dismissed outside the academy
  dismissedOne: 'a été destitué·e',
  dismissedMany: 'ont été destitué·e·s',
  line: '{people} {verb} de {possessive} fonctions de {fonction}. {emoji}',
  possessiveOne: 'ses',
  possessiveMany: 'leurs',
  functionJoiner: ' et ',
  thanksOne:
    'Nous le remercions pour son investissement dans l’équipe et lui souhaitons une bonne continuation. 🙏🏼',
  thanksMany:
    'Nous les remercions pour leur investissement dans l’équipe et leur souhaitons une bonne continuation. 🙏🏼',
} as const

/**
 * Copy of the derank gesture
 * @type {Record<string, string>}
 */

export const DERANK_COPY = {
  action: 'Dérank',
  pickTitle: 'Dérank plusieurs modérateurs',
  pickLead:
    'Coche les modérateurs concernés. Leur accès est coupé et ce qu’ils avaient renseigné est effacé pour de bon.',
  mergeTitle: 'Réunir des annonces de départ',
  mergeLead: 'Coche les départs à annoncer ensemble : le message les met tous dans un seul texte.',
  merge: 'Réunir',
  empty: 'Personne à choisir',
  merged: 'Annonces réunies',
  done: 'Modérateurs derank',
} as const
