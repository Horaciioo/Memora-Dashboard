'use client'

import type { ReactNode } from 'react'

import type { PlayDockProps } from '@/composites/play/dock/PlayDock'

import { PlayRoomBanner } from '@/composites/play/brand/PlayRoomBanner'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayReward } from '@/composites/play/hub/notices/PlayReward'
import { PlayOnlineProvider } from '@/composites/play/mobile/PlayOnline'
import { PlaySlide } from '@/composites/play/mobile/PlaySlide'
import { PlayTabBar } from '@/composites/play/mobile/PlayTabBar'
import { PlayInviteHost } from '@/composites/play/invites/PlayInviteHost'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { usePlayReward } from '@/core/hooks/data/play/usePlayReward'
import { useBareShell } from '@/core/hooks/interaction/layout/useBareShell'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_SHELL } from '@/declarations/ui/variants'

/**
 * Memora Play room, no rail, the base theme
 * @param {Object} props - Room
 * @param {ReactNode} props.children - Play page
 * @param {PlayDockProps} props.dock - Bottom dock data
 * @return {JSX.Element}
 */

export const PlayShell = ({ children, dock }: { children: ReactNode; dock: PlayDockProps }) => {
  useBareShell(true)
  const reward = usePlayReward(dock.profile)
  const isLight = usePlayMotionStore((state) => state.isLight)

  return (
    <PlayOnlineProvider sessionId={dock.presence?.sessionId ?? null}>
      <div className={PLAY_SHELL.room} data-light={isLight || undefined}>
        <div className={PLAY_SHELL.floor} aria-hidden="true" />
        <PlayRoomBanner />
        <div className={PLAY_SHELL.content}>
          <PlaySlide>{children}</PlaySlide>
        </div>
        <PlaySignal topic={PLAY_TOPICS.notices} />
        <PlaySignal topic={PLAY_TOPICS.groups} />
        <PlayTabBar
          player={dock.player}
          level={dock.profile.global.level.level}
          invites={dock.invites}
          presence={dock.presence}
          groupCalls={dock.groupCalls}
        />
        <PlayReward reward={reward} />
        <PlayInviteHost isPlay />
      </div>
    </PlayOnlineProvider>
  )
}
