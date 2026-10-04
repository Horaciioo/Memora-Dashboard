import 'server-only'

import type { AccessScope } from '@/core/services/auth/ScopeService'
import { listLevels, readCurrentState } from '@/core/services/livecon/LiveconService'
import { readPanel } from '@/core/services/sanctions/SanctionService'
import { youtuberOptions } from '@/core/services/work/shared'
import { levelOfCreator } from '@/declarations/livecon/levels'
import type { SanctionPanelView } from '@/types/sanctions'
import { SanctionPanels } from '@/utils/constants/moderation'

/**
 * First real Twitch panel of the perimeter, so a scripted Mod View reads true
 * @param {AccessScope} perimeter - Viewer perimeter
 * @return {Promise<{ panel: SanctionPanelView | null, levelNames: Record<string, string> }>} - Panel and level names
 */

export const readDemoPanel = async (
  perimeter: AccessScope
): Promise<{ panel: SanctionPanelView | null; levelNames: Record<string, string> }> => {
  const [creators, levels, state] = await Promise.all([
    youtuberOptions(perimeter),
    listLevels(),
    readCurrentState(perimeter),
  ])

  // The active creator first, else the first one holding a panel
  const candidates = perimeter.activeYoutuberId
    ? [perimeter.activeYoutuberId]
    : creators.map((creator) => creator.value)
  let panel: SanctionPanelView | null = null
  for (const creatorId of candidates) {
    const inForce = levelOfCreator(state, creatorId)?.level.id ?? levels[0]?.id ?? null
    const candidate = await readPanel(perimeter, creatorId, SanctionPanels.Twitch, inForce)
    if (candidate.offenses.length > 0) {
      panel = candidate
      break
    }
  }

  return {
    panel,
    levelNames: Object.fromEntries(levels.map((level) => [String(level.level), level.name])),
  }
}
