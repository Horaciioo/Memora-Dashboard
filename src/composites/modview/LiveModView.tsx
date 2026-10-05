'use client'

import { ModView } from '@/composites/modview/ModView'
import type { ModViewLiveTools } from '@/composites/modview/ModView'
import { useLiveModView } from '@/core/hooks/data/useLiveModView'
import { useModViewPresence } from '@/core/hooks/interaction/useModViewPresence'
import type { IconName } from '@/declarations/ui/icons'
import type { LiveView } from '@/types/lives'
import type { SanctionPanelView } from '@/types/sanctions'

export interface LiveModViewProps {
  live: LiveView
  panel: SanctionPanelView | null
  tools: ModViewLiveTools
  // Creator level
  fallbackLevel: { name: string; icon: IconName | null } | null
}

/**
 * Mod View of one real live
 * @param {LiveView} live - Live
 * @param {SanctionPanelView | null} panel - Creator panel at the level in force
 * @param {ModViewLiveTools} tools - History
 * @param {{ name: string, icon: IconName | null } | null} fallbackLevel - Creator level
 * @return {JSX.Element}
 */

export const LiveModView = ({ live, panel, tools, fallbackLevel }: LiveModViewProps) => {
  const driver = useLiveModView(live)
  useModViewPresence(live.id)

  return (
    <ModView
      driver={driver}
      permissions={live.permissions}
      panel={panel}
      levelName={live.liveconLevel?.name ?? fallbackLevel?.name ?? null}
      levelIcon={live.liveconLevel?.icon ?? fallbackLevel?.icon ?? null}
      live={tools}
    />
  )
}
