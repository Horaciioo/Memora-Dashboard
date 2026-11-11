import { ACCESS_HANDLERS } from '@/core/services/nexus/handlers/access'
import { SYSTEM_HANDLERS } from '@/core/services/nexus/handlers/system'
import { DB_HANDLERS } from '@/core/services/nexus/handlers/db'
import { ERROR_HANDLERS } from '@/core/services/nexus/handlers/errors'
import { HEALTH_HANDLERS } from '@/core/services/nexus/handlers/health'
import { MEMORA_HANDLERS } from '@/core/services/nexus/handlers/memora'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

/**
 * Every handler by key
 * @type {Record<string, NexusHandler>}
 */

export const NEXUS_HANDLERS: Record<string, NexusHandler> = {
  ...ACCESS_HANDLERS,
  ...MEMORA_HANDLERS,
  ...ERROR_HANDLERS,
  ...HEALTH_HANDLERS,
  ...DB_HANDLERS,
  ...SYSTEM_HANDLERS,
}
