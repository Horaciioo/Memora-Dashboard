'use client'

import { ModView } from '@/composites/modview/ModView'
import { useReread } from '@/composites/lives/LiveGate'
import type { ModViewLiveTools } from '@/composites/modview/ModView'
import { AvatarProvider } from '@/core/hooks/data/lives/useAvatars'
import { SharedWordsProvider } from '@/core/hooks/data/lives/useSharedWords'
import { useLivePanel } from '@/core/hooks/data/lives/useLivePanel'
import { useLiveModView } from '@/core/hooks/data/lives/useLiveModView'
import { useModViewPresence } from '@/core/hooks/interaction/scenes/useModViewPresence'
import type { IconName } from '@/declarations/ui/icons'
import type { LiveView, ModViewCreator } from '@/types/lives'
import type { SanctionPanelView } from '@/types/sanctions'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export interface LiveModViewProps {
  live: LiveView
  panel: SanctionPanelView | null
  tools: ModViewLiveTools
  // Creator level
  fallbackLevel: { name: string; icon: IconName | null } | null
  creators: ModViewCreator[]
}

/**
 * Mod View of one real live
 * @param {LiveView} live - Live
 * @param {SanctionPanelView | null} panel - Creator panel at the level in force, kept fresh
 * @param {ModViewLiveTools} tools - History
 * @param {{ name: string, icon: IconName | null } | null} fallbackLevel - Creator level
 * @return {JSX.Element}
 */

export const LiveModView = ({
  live,
  panel: initialPanel,
  tools,
  fallbackLevel,
  creators,
}: LiveModViewProps) => {
  const panel = useLivePanel(initialPanel)
  const driver = useLiveModView(live)
  const reread = useReread()
  useModViewPresence(live.id)

  return (
    <AvatarProvider liveId={live.id}>
      <SharedWordsProvider
        liveId={live.id}
        canEdit={live.permissions.includes(Permissions.LiveSharedWords)}
      >
        <ModView
          driver={driver}
          watchOnly={live.status !== LiveStatuses.Live}
          permissions={live.permissions}
          panel={panel}
          levelName={live.liveconLevel?.name ?? fallbackLevel?.name ?? null}
          levelIcon={live.liveconLevel?.icon ?? fallbackLevel?.icon ?? null}
          live={tools}
          creators={creators}
          onReread={reread}
        />
      </SharedWordsProvider>
    </AvatarProvider>
  )
}
