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
    lead: 'Le site Memora',
    kind: 'http',
    target: read('STATUS_APP_URL', 'http://app:3000/connexion'),
  },
  {
    id: 'api',
    label: 'API',
    lead: 'Les échanges de données de Memora',
    kind: 'http',
    target: read('STATUS_API_URL', 'http://app:3000/api/sante'),
  },
  {
    id: 'database',
    label: 'Données',
    lead: 'Tes modérateurs, tâches et réunions',
    kind: 'tcp',
    target: read('STATUS_DATABASE_ADDRESS', 'db:5432'),
  },
  {
    id: 'cache',
    label: 'Rappels et notifications',
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
