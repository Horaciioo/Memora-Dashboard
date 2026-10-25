import type { Tone } from '@/declarations/ui/theme'
import type { LogLevelName } from '@/utils/constants/events'

/**
 * Period filter choices
 * @type {Record<string, { label: string, hours: number | null }>}
 */

export const JOURNAL_PERIODS = {
  day: { label: '24 dernières heures', hours: 24 },
  week: { label: '7 derniers jours', hours: 24 * 7 },
  month: { label: '30 derniers jours', hours: 24 * 30 },
  all: { label: 'Toute la période', hours: null },
} as const

export type JournalPeriod = keyof typeof JOURNAL_PERIODS

// Period when none is chosen
export const JOURNAL_DEFAULT_PERIOD: JournalPeriod = 'week'

/**
 * Query string keys of the filters
 * @type {Record<string, string>}
 */

export const JOURNAL_PARAMS = {
  level: 'niveau',
  event: 'type',
  origin: 'origine',
  actor: 'acteur',
  period: 'periode',
  search: 'q',
  page: 'page',
} as const

/**
 * Journal limits
 * @type {Record<string, number>}
 */

export const JOURNAL_LIMITS = {
  pageSize: 50,
  exportRows: 5000,
  actorChoices: 100,
  searchLength: 100,
} as const

/**
 * Copy of the journal page
 * @type {Record<string, string>}
 */

export const JOURNAL_COPY = {
  title: 'Logs',
  searchPlaceholder: 'Rechercher un texte, une adresse, une route…',
  searchLabel: 'Recherche',
  levelLabel: 'Niveau',
  eventLabel: 'Type',
  originLabel: 'Origine',
  actorLabel: 'Acteur',
  periodLabel: 'Période',
  allLevels: 'Tous les niveaux',
  allEvents: 'Tous les types',
  allOrigins: 'Toutes les origines',
  allActors: 'Tous les acteurs',
  reset: 'Réinitialiser',
  export: 'Exporter en CSV',
  exportFile: 'journal-memora',
  exportFailed: 'L’export a échoué.',
  statLast24h: 'Dernières 24 h',
  statWarnings: 'Alertes (24 h)',
  statErrors: 'Erreurs (24 h)',
  statLastError: 'Dernière erreur',
  statNoError: 'Aucune',
  resultsLead: 'Résultats',
  noResultTitle: 'Aucun évènement',
  noResultLead: 'Aucune entrée ne correspond à ces filtres.',
  detailAddress: 'Adresse',
  detailClient: 'Navigateur',
  detailRoute: 'Requête',
  detailOrigin: 'Origine',
  detailTarget: 'Cible',
  detailTrace: 'Trace',
  detailUnknown: 'Inconnu',
  system: 'Système',
  columns: ['Moment', 'Niveau', 'Type', 'Acteur', 'Détail'],
  csvHeader: [
    'Moment',
    'Niveau',
    'Type',
    'Origine',
    'Acteur',
    'Résumé',
    'Adresse',
    'Requête',
    'Navigateur',
    'Cible',
  ],
} as const

/**
 * Colour of each severity
 * @type {Record<LogLevelName, Tone>}
 */

export const JOURNAL_LEVEL_TONES: Record<LogLevelName, Tone> = {
  Info: 'neutral',
  Warning: 'warning',
  Error: 'danger',
}
