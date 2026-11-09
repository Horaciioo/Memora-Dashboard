import 'server-only'
import type { ParkourStanding } from '@/core/services/academy/parkour/ParkourService'
import {
  destinationHref,
  GUIDE_PARAMS,
  PIM_DESTINATION_REGISTRY,
} from '@/declarations/academy/guides'
import type { PimDestinationName } from '@/declarations/academy/guides'
import { ROUTES } from '@/declarations/navigation'
import type { HomeTask } from '@/types/personal'

/**
 * Build a task pointing at a declared destination
 * @param {Object} input - Task input
 * @param {string} input.key - Stable identifier
 * @param {HomeTask['kind']} input.kind - Where it comes from
 * @param {string} input.title - What to do
 * @param {string} input.context - Who or what it concerns
 * @param {PimDestinationName} input.destination - Where it gets done
 * @param {string} input.sessionId - Promotion
 * @param {string | null} input.juniorId - Junior
 * @param {string} input.description - What must happen
 * @return {HomeTask} - Task
 */

export const guidedTask = ({
  key,
  kind,
  title,
  context,
  destination,
  sessionId,
  juniorId,
  description,
}: {
  key: string
  kind: HomeTask['kind']
  title: string
  context: string
  destination: PimDestinationName
  sessionId: string
  juniorId: string | null
  description: string
}): HomeTask => ({
  key,
  kind,
  title,
  context,
  icon: PIM_DESTINATION_REGISTRY.get(destination).icon,
  href: destinationHref(destination, { sessionId, juniorId }),
  description,
  guide: null,
  destinationLabel: PIM_DESTINATION_REGISTRY.label(destination),
  dueAt: null,
})

/**
 * Link to one tab of a junior's file
 * @param {ParkourStanding} standing - Junior
 * @param {string} tab - File tab
 * @return {string} - Address
 */

export const fileTab = (standing: ParkourStanding, tab: string): string =>
  `${ROUTES.junior(standing.sessionId, standing.juniorId)}?${new URLSearchParams({
    [GUIDE_PARAMS.tab]: tab,
  })}`
