/**
 * Component health
 * @type {readonly ['up', 'degraded', 'down']}
 */

export const HEALTH_LEVELS = ['up', 'degraded', 'down'] as const

export type Health = (typeof HEALTH_LEVELS)[number]

/**
 * Probe kinds
 * @typedef {Object} ProbeTarget
 * @property {string} id - Component key
 * @property {string} label - Display name
 * @property {string} lead - What it does
 * @property {'http' | 'tcp'} kind - Probe kind
 * @property {string} target - URL or host:port
 */

export interface ProbeTarget {
  id: string
  label: string
  lead: string
  kind: 'http' | 'tcp'
  target: string
}

/**
 * Read an env value
 * @param {string} key - Variable name
 * @param {string} fallback - Default value
 * @return {string} - Value
 */

const read = (key: string, fallback: string): string => process.env[key] || fallback

/**
 * Watched components
 * @type {ProbeTarget[]}
 */

export const COMPONENTS: ProbeTarget[] = [
  {
    id: 'app',
    label: 'Application',
    lead: 'Le site Memora et son API',
    kind: 'http',
    target: read('STATUS_APP_URL', 'http://app:3000/api/sante'),
  },
  {
    id: 'database',
    label: 'Base de données',
    lead: 'Tes modérateurs, tâches et réunions',
    kind: 'tcp',
    target: read('STATUS_DATABASE_ADDRESS', 'db:5432'),
  },
  {
    id: 'cache',
    label: 'Cache et files',
    lead: 'Rappels, notifications et tâches de fond',
    kind: 'tcp',
    target: read('STATUS_CACHE_ADDRESS', 'redis:6379'),
  },
  {
    id: 'discord',
    label: 'Connexion Discord',
    lead: 'Le bouton Se connecter avec Discord',
    kind: 'http',
    target: read('STATUS_DISCORD_URL', 'https://discord.com/api/v10/gateway'),
  },
]

/**
 * Tuning values
 * @type {Object}
 */

export const SETTINGS = {
  port: Number(read('STATUS_PORT', '3001')),
  dataFile: read('STATUS_DATA_FILE', '/data/state.json'),
  intervalMs: 60_000,
  timeoutMs: 5_000,
  slowMs: 2_000,
  // Checks in a row before an incident opens or closes
  confirmations: 2,
  historyDays: 90,
  incidentsShown: 20,
  // Down checks that colour a whole day red
  redDayChecks: 3,
  timeZone: 'Europe/Paris',
} as const

/**
 * Displayed texts
 * @type {Object}
 */

export const COPY = {
  title: 'Memora Statut',
  lead: 'Ici, tu vois si Memora fonctionne, même quand le site ne répond plus.',
  overall: {
    up: 'Tout fonctionne',
    degraded: 'Fonctionnement dégradé',
    down: 'Panne en cours',
  },
  health: { up: 'Opérationnel', degraded: 'Dégradé', down: 'Hors service' },
  noData: 'Pas de mesure ce jour-là',
  components: 'Services',
  incidents: 'Incidents passés',
  noIncident: 'Aucun incident enregistré.',
  ongoing: 'En cours',
  resolved: 'Résolu',
  duration: 'Durée',
  uptime: 'de disponibilité',
  daysAgo: (days: number) => `Il y a ${days} jours`,
  today: "Aujourd'hui",
  refreshed: 'Mis à jour',
  waiting: 'Première mesure en cours, reviens dans une minute.',
  incidentTitle: (label: string, health: Health) =>
    `${label} : ${health === 'down' ? 'hors service' : 'fonctionnement dégradé'}`,
} as const
