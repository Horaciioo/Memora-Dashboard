import { DB_CHECK_HANDLERS } from '@/core/services/nexus/handlers/db/check'
import { DB_HISTORY_HANDLERS } from '@/core/services/nexus/handlers/db/history'
import { DB_LINK_HANDLERS } from '@/core/services/nexus/handlers/db/links'
import { DB_MIGRATE_HANDLERS } from '@/core/services/nexus/handlers/db/migrate'
import { DB_READ_HANDLERS } from '@/core/services/nexus/handlers/db/read'
import { DB_ROLLBACK_HANDLERS } from '@/core/services/nexus/handlers/db/rollback'
import { DB_STRUCTURE_HANDLERS } from '@/core/services/nexus/handlers/db/structure'
import { DB_WRITE_HANDLERS } from '@/core/services/nexus/handlers/db/write'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

/**
 * Every database handler
 * @type {Record<string, NexusHandler>}
 */

export const DB_HANDLERS: Record<string, NexusHandler> = {
  ...DB_READ_HANDLERS,
  ...DB_STRUCTURE_HANDLERS,
  ...DB_LINK_HANDLERS,
  ...DB_HISTORY_HANDLERS,
  ...DB_CHECK_HANDLERS,
  ...DB_WRITE_HANDLERS,
  ...DB_MIGRATE_HANDLERS,
  ...DB_ROLLBACK_HANDLERS,
}
