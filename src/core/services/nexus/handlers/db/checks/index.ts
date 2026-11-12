import { emptyRunningGames } from '@/core/services/nexus/handlers/db/checks/emptyRunningGames'
import { expiredSessions } from '@/core/services/nexus/handlers/db/checks/expiredSessions'
import { orphanFiles } from '@/core/services/nexus/handlers/db/checks/orphanFiles'
import { seatsWithoutOutcome } from '@/core/services/nexus/handlers/db/checks/seatsWithoutOutcome'
import { staleLiveMembers } from '@/core/services/nexus/handlers/db/checks/staleLiveMembers'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'
import { unknownFeatures } from '@/core/services/nexus/handlers/db/checks/unknownFeatures'

/**
 * Every inconsistency rule
 * @type {DbCheck[]}
 */

export const DB_CHECKS: DbCheck[] = [
  expiredSessions,
  unknownFeatures,
  seatsWithoutOutcome,
  emptyRunningGames,
  staleLiveMembers,
  orphanFiles,
]
