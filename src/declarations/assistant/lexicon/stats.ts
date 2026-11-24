/**
 * Period a figure can be asked over
 * @typedef {Object} StatsPeriodDef
 * @property {string} id - Window id
 * @property {string[]} phrases - Folded runs of words
 * @property {string} label - How Memora says it
 */

export interface StatsPeriodDef {
  id: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear'
  phrases: readonly string[]
  label: string
}

/**
 * Windows of time, the longest names are tried first
 * @type {StatsPeriodDef[]}
 */

export const STATS_PERIODS: readonly StatsPeriodDef[] = [
  { id: 'lastWeek', phrases: ['semaine derniere', 'semaine passee'], label: 'la semaine dernière' },
  { id: 'lastMonth', phrases: ['mois dernier', 'mois passe'], label: 'le mois dernier' },
  { id: 'thisWeek', phrases: ['cette semaine', 'semaine en cours'], label: 'cette semaine' },
  { id: 'thisMonth', phrases: ['ce mois', 'mois en cours', 'ce mois ci'], label: 'ce mois' },
  {
    id: 'thisYear',
    phrases: ['cette annee', 'annee en cours', 'depuis le debut de l annee'],
    label: 'depuis le début de l’année',
  },
  { id: 'yesterday', phrases: ['hier'], label: 'hier' },
  { id: 'today', phrases: ['aujourdhui'], label: 'aujourd’hui' },
]

/**
 * Words that follow a number in « les 30 derniers jours »
 * @type {{ last: string[], days: string[] }}
 */

export const STATS_LAST_WORDS = {
  last: ['derniers', 'dernieres', 'passes', 'passees'],
  days: ['jours', 'jour'],
} as const
