import { CACHE_HANDLERS } from '@/core/services/nexus/handlers/system/cache'
import { EVENT_HANDLERS } from '@/core/services/nexus/handlers/system/events'
import { MAINTENANCE_HANDLERS } from '@/core/services/nexus/handlers/system/maintenance'
import { QUEUE_HANDLERS } from '@/core/services/nexus/handlers/system/queues'
import { SERVICE_HANDLERS } from '@/core/services/nexus/handlers/system/services'
import { STATUS_HANDLERS } from '@/core/services/nexus/handlers/system/status'
import { CONFIGURATION_HANDLERS } from '@/core/services/nexus/handlers/configurations'
import { FEATURE_HANDLERS } from '@/core/services/nexus/handlers/feature'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

/**
 * Every system, configuration and feature handler
 * @type {Record<string, NexusHandler>}
 */

export const SYSTEM_HANDLERS: Record<string, NexusHandler> = {
  ...STATUS_HANDLERS,
  ...SERVICE_HANDLERS,
  ...MAINTENANCE_HANDLERS,
  ...CACHE_HANDLERS,
  ...QUEUE_HANDLERS,
  ...EVENT_HANDLERS,
  ...CONFIGURATION_HANDLERS,
  ...FEATURE_HANDLERS,
}
