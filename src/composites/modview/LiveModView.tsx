'use client'

import { ModView } from '@/composites/modview/ModView'
import { useLiveModView } from '@/core/hooks/data/useLiveModView'
import type { LiveView } from '@/types/lives'
import type { SanctionPanelView } from '@/types/sanctions'

export interface LiveModViewProps {
  live: LiveView
  panel: SanctionPanelView | null
}

/**
 * Mod View of one real live
 * @param {LiveView} live - Live
 * @param {SanctionPanelView | null} panel - Creator panel at the level in force
 * @return {JSX.Element}
 */

export const LiveModView = ({ live, panel }: LiveModViewProps) => {
  const driver = useLiveModView(live)

  return (
    <ModView
      driver={driver}
      permissions={live.permissions}
      panel={panel}
      levelName={live.liveconLevel?.name ?? null}
    />
  )
}
