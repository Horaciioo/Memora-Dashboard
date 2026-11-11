import type { ConfigSubject } from '@/types/infrastructure'

/**
 * Decision taken on one infrastructure subject
 * @typedef {Object} ServiceEntry
 * @property {boolean} restartable - Nexus may restart it
 * @property {ConfigSubject[]} dependsOn - Subjects it needs
 */

export interface ServiceEntry {
  restartable: boolean
  dependsOn: ConfigSubject[]
}

/**
 * Infrastructure managers
 * @type {Record<ConfigSubject, ServiceEntry>}
 */

export const SERVICE_INVENTORY: Record<ConfigSubject, ServiceEntry> = {
  database: { restartable: false, dependsOn: [] },
  redis: { restartable: false, dependsOn: [] },
  queues: { restartable: true, dependsOn: ['redis'] },
  storage: { restartable: false, dependsOn: [] },
  encryption: { restartable: false, dependsOn: [] },
  telemetry: { restartable: false, dependsOn: [] },
  logger: { restartable: false, dependsOn: [] },
  uptime: { restartable: false, dependsOn: [] },
}

/**
 * Background services of the process
 * @type {readonly string[]}
 */

export const BACKGROUND_SERVICES = [
  'LiveWatcher',
  'LiveStatePoller',
  'LiveSampler',
  'realtimeHub',
  'playBots',
  'playTimers',
] as const

/**
 * Realtime topic families of the hub
 * @type {readonly string[]}
 */

export const REALTIME_FAMILIES = ['play', 'recruitment', 'page', 'section', 'teamChat'] as const
