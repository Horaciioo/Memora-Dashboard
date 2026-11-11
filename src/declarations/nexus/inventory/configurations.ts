/**
 * Folders of configuration files
 * @type {readonly string[]}
 */

export const CONFIGURATION_FOLDERS = ['system', 'play', 'reference', 'default'] as const

export type ConfigurationFolder = (typeof CONFIGURATION_FOLDERS)[number]

/**
 * Files of each folder
 * @type {Record<ConfigurationFolder, string[]>}
 */

export const CONFIGURATION_FILES: Record<ConfigurationFolder, string[]> = {
  system: [
    'absences',
    'academy',
    'admin-identity',
    'agenda',
    'application',
    'assistant',
    'authentication',
    'cache',
    'calendar',
    'colours',
    'emojis',
    'exercises',
    'failures',
    'files',
    'forms',
    'gestures',
    'home',
    'legacy',
    'livecon',
    'lives',
    'management',
    'nexus',
    'notifications',
    'pages',
    'pagination',
    'perimeter',
    'platforms',
    'rate-limits',
    'realtime',
    'recruitment',
    'responsive',
    'retention',
    'sanctions',
    'search',
    'timeouts',
    'tour',
    'two-factor',
    'versioning',
  ],
  play: ['baccalaureat', 'bomb', 'bots', 'golf', 'ludo', 'naval', 'play'],
  reference: [
    'eventTemplates',
    'networks',
    'platforms',
    'recruitmentTimeline',
    'schemes',
    'skills',
    'states',
  ],
  default: [
    'database.default',
    'encryption.default',
    'logger.default',
    'queues.default',
    'redis.default',
    'storage.default',
    'telemetry.default',
    'uptime.default',
  ],
}

/**
 * Files an overlay may change, none before the configuration module
 * @type {string[]}
 */

export const EDITABLE_CONFIGURATIONS: string[] = []
