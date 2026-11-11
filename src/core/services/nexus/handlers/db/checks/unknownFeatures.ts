import 'server-only'

import { prisma } from '@/core/lib/db'
import type { DbCheck } from '@/core/services/nexus/handlers/db/checks/types'
import { FEATURE_MAP } from '@/declarations/features'

/**
 * Switches of a removed feature
 * @type {DbCheck}
 */

export const unknownFeatures: DbCheck = {
  id: 'unknownFeatures',
  label: 'Interrupteurs d’une fonctionnalité inconnue',
  fix: '$update.memora.feature.<nom> --mode=on',
  run: async (limit) =>
    (await prisma.featureSwitch.findMany({ select: { key: true }, take: limit * 5 }))
      .map((row) => row.key)
      .filter((key) => !FEATURE_MAP.has(key))
      .slice(0, limit),
}
