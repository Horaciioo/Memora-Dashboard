/**
 * Locale used by every date helper
 * @type {string}
 */

export const DATE_LOCALE = 'fr-FR'

/**
 * Zone clock times read in until a member picks theirs
 * @type {string}
 */

export const DEFAULT_ZONE = 'Europe/Paris'

/**
 * Month abbreviations
 * @type {string[]}
 */

export const MONTH_LABELS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
]

/**
 * Relative day wording
 * @type {Record<string, string>}
 */

export const DATE_COPY = {
  at: 'à',
  today: 'aujourd’hui',
  tomorrow: 'demain',
  yesterday: 'hier',
  inDays: 'dans {count} j',
  justNow: 'à l’instant',
  minutesAgo: 'il y a {count} min',
  hoursAgo: 'il y a {count} h',
  daysAgo: 'il y a {count} j',
  overdue: 'en retard',
  day: 'jour',
  days: 'jours',
  none: 'Non renseigné',
} as const
