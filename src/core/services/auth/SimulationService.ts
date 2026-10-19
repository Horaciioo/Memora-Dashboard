import 'server-only'

import { isActualAdmin } from '@/core/lib/auth/simulation'
import { readLedCreators } from '@/core/services/auth/LeadService'
import type { ActualIdentity } from '@/types/auth'

/**
 * Creators a simulated level reaches
 * @param {string} accountId - Account identifier
 * @param {ActualIdentity} actual - Real identity
 * @param {string | null} active - Creator picked
 * @return {Promise<string[]>} - Creator identifiers
 */

export const simulatedCreatorIds = async (
  accountId: string,
  actual: ActualIdentity,
  active: string | null
): Promise<string[]> => {
  if (!active) return actual.youtuberIds

  // Only a creator the member truly reaches
  const led = isActualAdmin(actual) ? [] : await readLedCreators(accountId)
  const reachable = [...actual.youtuberIds, ...led.map((creator) => creator.id)]

  return isActualAdmin(actual) || reachable.includes(active) ? [active] : actual.youtuberIds
}
