/**
 * Link to the status service
 * @type {Record<string, string | number>}
 */

export const STATUS_LINK = {
  endpoint: process.env.STATUS_URL || 'http://127.0.0.1:3001/api/status',
  timeoutMs: 2000,
} as const

/**
 * Copy of the status blocks
 * @type {Record<string, string>}
 */

export const STATUS_COPY = {
  title: 'Memora Statut',
  brand: 'Memora Status',
  unavailable: 'Le statut est momentanément indisponible',
  lead: 'Ici, tu vois si Memora fonctionne.',
  servicesTitle: 'Services',
  version: 'Version',
  ago: 'Il y a 90 jours',
  today: 'Aujourd’hui',
  offlineTitle: 'Le service de statut ne répond pas',
  offlineLead: 'Memora fonctionne, mais plus personne ne surveille ses services.',
  health: { up: 'Opérationnel', degraded: 'Dégradé', down: 'Hors service' },
  overall: {
    up: 'Tous les systèmes sont opérationnels',
    degraded: 'Fonctionnement dégradé',
    down: 'Panne en cours',
  },
  pending: 'Première mesure en cours',
  uptime: 'de disponibilité',
  incidents: 'Incidents',
  noIncident: 'Aucun incident enregistré.',
  ongoing: 'En cours',
  resolved: 'Résolu',
  noData: 'Pas de mesure ce jour-là.',
  dayLevel: {
    up: 'Aucune panne enregistrée ce jour-là.',
    degraded: 'Fonctionnement dégradé ce jour-là.',
    down: 'Panne enregistrée ce jour-là.',
  },
} as const
