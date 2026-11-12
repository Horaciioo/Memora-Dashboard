import 'server-only'

import { findOrphanFiles } from '@/core/services/system/FileService'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'

// Hours before a file counts as orphan
const ORPHAN_AGE_HOURS = 24

/**
 * Stored files nothing points at
 * @type {DbCheck}
 */

export const orphanFiles: DbCheck = {
  id: 'orphanFiles',
  label: 'Fichiers orphelins',
  fix: '$db.get.storageEntry --id=<fichier>',
  run: async (limit) =>
    (await findOrphanFiles(ORPHAN_AGE_HOURS)).slice(0, limit).map((file) => file.id),
}
