/**
 * Days a figure of the Live hub covers, and how many lives are listed
 * @type {{ periodDays: number, recentCount: number }}
 */

export const LIVE_HUB = {
  periodDays: 30,
  recentCount: 5,
} as const

/**
 * Copy of the personal Live hub
 * @type {Record<string, string>}
 */

export const LIVE_HUB_COPY = {
  title: 'Live',
  creatorLabel: 'Créateur',
  periodNote: '30 derniers jours, comparés aux 30 précédents',
  infractions: 'Infractions traitées',
  time: 'Temps passé à modérer',
  messages: 'Messages envoyés',
  lives: 'Lives modérés',
  trendNew: 'Nouveau',
  nothingPlanned: 'Aucun live annoncé pour le moment !',
  moderate: 'Modérer',
  onAir: 'En direct',
  recentTitle: 'Derniers lives modérés',
  recentEmpty: 'Tu n’as encore modéré aucun live pour ce créateur.',
  recentGestures: '{count} gestes',
  recentTime: '{time} actif',
  reinforcement: 'Renfort',
} as const
