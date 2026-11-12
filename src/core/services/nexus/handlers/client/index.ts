import { CLIENT_HANDLERS } from '@/core/services/nexus/handlers/client/read'
import { TOPIC_HANDLERS } from '@/core/services/nexus/handlers/client/topics'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

/**
 * Every client and realtime handler
 * @type {Record<string, NexusHandler>}
 */

export const REALTIME_HANDLERS: Record<string, NexusHandler> = {
  ...CLIENT_HANDLERS,
  ...TOPIC_HANDLERS,
}
