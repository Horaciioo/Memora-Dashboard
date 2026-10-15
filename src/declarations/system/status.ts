/**
 * Link to the status service
 * @type {Record<string, string | number>}
 */

export const STATUS_LINK = {
  endpoint: process.env.STATUS_URL || 'http://127.0.0.1:3001/api/status',
  // Public page, shown as a link when set
  publicUrl: process.env.STATUS_PUBLIC_URL || '',
  timeoutMs: 2000,
} as const

/**
 * Copy of the status blocks
 * @type {Record<string, string>}
 */

export const STATUS_COPY = {
  title: 'Memora Statut',
  offlineTitle: 'Le service de statut ne répond pas',
  offlineLead: 'Memora fonctionne, mais plus personne ne surveille ses services.',
  health: { up: 'Opérationnel', degraded: 'Dégradé', down: 'Hors service' },
  overall: { up: 'Tout fonctionne', degraded: 'Fonctionnement dégradé', down: 'Panne en cours' },
  pending: 'Première mesure en cours',
  uptime: 'de disponibilité',
  history: '90 jours',
  incidents: 'Incidents',
  noIncident: 'Aucun incident enregistré.',
  ongoing: 'En cours',
  resolved: 'Résolu',
  open: 'Ouvrir la page publique',
  noData: 'Pas de mesure ce jour-là',
} as const
