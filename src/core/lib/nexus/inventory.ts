import 'server-only'

import { readModels } from '@/core/lib/nexus/schema'
import { ENTITY_INVENTORY, GAME_INVENTORY, SERVICE_INVENTORY } from '@/declarations/nexus/inventory'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { PlayGames } from '@/utils/constants/play'

/**
 * Counters and gaps of the inventory
 * @typedef {Object} InventoryReport
 * @property {Record<string, number>} counts - Items per family
 * @property {string[]} unranged - Items found in the code but not ranged
 * @property {string[]} stale - Entries pointing at nothing
 */

export interface InventoryReport {
  counts: Record<string, number>
  unranged: string[]
  stale: string[]
}

/**
 * Compare the inventory with the code
 * @return {InventoryReport} - Counters and gaps
 */

export const buildInventoryReport = (): InventoryReport => {
  const models = readModels()
  const modelNames = new Set(models.map((model) => model.name))
  const ranged = new Set(Object.values(ENTITY_INVENTORY).map((entry) => entry.model))

  // Models without a decision
  const unranged = models.filter((model) => !ranged.has(model.name)).map((model) => model.name)

  // Entries without a model
  const stale = Object.values(ENTITY_INVENTORY)
    .filter((entry) => !modelNames.has(entry.model))
    .map((entry) => entry.model)

  // Games without an entry
  const missingGames = Object.values(PlayGames).filter((game) => !(game in GAME_INVENTORY))

  return {
    counts: {
      entities: models.length,
      games: Object.keys(GAME_INVENTORY).length,
      services: Object.keys(SERVICE_INVENTORY).length,
      jobs: JOB_REGISTRY.keys.length,
    },
    unranged: [...unranged, ...missingGames],
    stale,
  }
}
