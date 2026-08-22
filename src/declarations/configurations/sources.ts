import databaseDefault from '@/configurations/default/database.default.json'
import encryptionDefault from '@/configurations/default/encryption.default.json'
import loggerDefault from '@/configurations/default/logger.default.json'
import queuesDefault from '@/configurations/default/queues.default.json'
import redisDefault from '@/configurations/default/redis.default.json'
import storageDefault from '@/configurations/default/storage.default.json'
import telemetryDefault from '@/configurations/default/telemetry.default.json'
import uptimeDefault from '@/configurations/default/uptime.default.json'

import databaseTemplate from '@/configurations/template/database.template.json'
import encryptionTemplate from '@/configurations/template/encryption.template.json'
import loggerTemplate from '@/configurations/template/logger.template.json'
import queuesTemplate from '@/configurations/template/queues.template.json'
import redisTemplate from '@/configurations/template/redis.template.json'
import storageTemplate from '@/configurations/template/storage.template.json'
import telemetryTemplate from '@/configurations/template/telemetry.template.json'
import uptimeTemplate from '@/configurations/template/uptime.template.json'

import loggerDev from '@/configurations/environments/dev/logger.dev.json'

import loggerStaging from '@/configurations/environments/staging/logger.staging.json'
import uptimeStaging from '@/configurations/environments/staging/uptime.staging.json'

import loggerRelease from '@/configurations/environments/release/logger.release.json'
import uptimeRelease from '@/configurations/environments/release/uptime.release.json'

import loggerMain from '@/configurations/environments/main/logger.main.json'
import storageMain from '@/configurations/environments/main/storage.main.json'
import uptimeMain from '@/configurations/environments/main/uptime.main.json'

import type { ConfigSubject, Environment } from '@/types/infrastructure'

/**
 * Configuration layer
 * @type {Partial<Record<ConfigSubject, unknown>>}
 */

type ConfigLayer = Partial<Record<ConfigSubject, unknown>>

/**
 * Configuration sources
 * @typedef {Object} ConfigSources
 * @property {ConfigLayer} default - Baseline values
 * @property {Record<Environment, ConfigLayer>} environments - Branch overrides
 * @property {ConfigLayer} template - Variable placeholders
 */

interface ConfigSources {
  default: ConfigLayer
  environments: Record<Environment, ConfigLayer>
  template: ConfigLayer
}

/**
 * Raw configuration sources
 * @type {ConfigSources}
 */

export const CONFIG_SOURCES: ConfigSources = {
  default: {
    database: databaseDefault,
    redis: redisDefault,
    queues: queuesDefault,
    storage: storageDefault,
    encryption: encryptionDefault,
    telemetry: telemetryDefault,
    logger: loggerDefault,
    uptime: uptimeDefault,
  },
  environments: {
    dev: { logger: loggerDev },
    staging: { logger: loggerStaging, uptime: uptimeStaging },
    release: { logger: loggerRelease, uptime: uptimeRelease },
    main: { logger: loggerMain, storage: storageMain, uptime: uptimeMain },
  },
  template: {
    database: databaseTemplate,
    redis: redisTemplate,
    queues: queuesTemplate,
    storage: storageTemplate,
    encryption: encryptionTemplate,
    telemetry: telemetryTemplate,
    logger: loggerTemplate,
    uptime: uptimeTemplate,
  },
}
