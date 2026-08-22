/**
 * Locale used by every date helper
 * @type {string}
 */

export const DATE_LOCALE = 'fr-FR'

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
  daysAgo: 'il y a {count} j',
  overdue: 'en retard',
  day: 'jour',
  days: 'jours',
  none: '—',
} as const
