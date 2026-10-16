/**
 * Copy of the activity page
 * @type {Record<string, string>}
 */

export const AUDIENCE_COPY = {
  activeDay: 'Actifs aujourd’hui',
  activeWeek: 'Actifs sur 7 jours',
  activeMonth: 'Actifs sur 30 jours',
  logins: 'Connexions (7 jours)',
  sessions: 'Sessions ouvertes',
  daily: 'Membres actifs par jour',
  dailyLead: '30 derniers jours, un membre compte une fois par jour.',
  browsers: 'Navigateurs',
  systems: 'Systèmes',
  handhelds: 'Sessions sur mobile',
  top: 'Les plus actifs',
  topLead: 'Nombre d’actions sur 30 jours.',
  actions: 'actions',
  unknown: 'Inconnu',
  emptyTitle: 'Aucune activité',
  emptyLead: 'Les chiffres arrivent dès que des membres utilisent Memora.',
} as const

/**
 * Audience window sizes
 * @type {Record<string, number>}
 */

export const AUDIENCE_WINDOWS = {
  days: 30,
  topMembers: 8,
  sessionsRead: 2000,
} as const
