'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { PlayAdminRoom } from '@/composites/play/admin/PlayAdminRoom'
import { PlayCardHost } from '@/composites/play/card/PlayCardHost'
import { PlayFriendsPanel } from '@/composites/play/friends/PlayFriendsPanel'
import { PlayDeskBar } from '@/composites/play/topbar/PlayDeskBar'
import { PlayBusyToast } from '@/composites/play/loading/PlayBusyToast'

import type { PlayDockProps } from '@/composites/play/dock/PlayDock'

import { PlayRoomBanner } from '@/composites/play/brand/PlayRoomBanner'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayTrophyNotice } from '@/composites/play/hub/notices/PlayTrophyNotice'
import { PlayReward } from '@/composites/play/hub/notices/PlayReward'
import { PlayOnlineProvider } from '@/composites/play/mobile/PlayOnline'
import { PlaySlide } from '@/composites/play/mobile/PlaySlide'
import { PlayTabBar } from '@/composites/play/mobile/PlayTabBar'
import { PlayInviteHost } from '@/composites/play/invites/PlayInviteHost'
import type { TrophyNotice } from '@/core/services/play'
import type { PlayFriendsState, PlayLobbyCard } from '@/types/play'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { PlayCelebration } from '@/composites/play/celebration/PlayCelebration'
import { usePlayReward } from '@/core/hooks/data/play/usePlayReward'
import { useBareShell } from '@/core/hooks/interaction/layout/useBareShell'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_SHELL } from '@/declarations/ui/variants'

/**
 * Memora Play room, top bar
 * @param {Object} props - Room
 * @param {ReactNode} props.children - Play page
 * @param {PlayDockProps} props.dock - Bottom dock data
 * @param {TrophyNotice | null} props.trophyNotice - Trophy back payment to read
 * @param {PlayFriendsState} props.friends - Friends and requests
 * @param {PlayLobbyCard[]} props.tables - Open and running tables
 * @return {JSX.Element}
 */

export const PlayShell = ({
  children,
  dock,
  trophyNotice,
  friends,
  tables,
}: {
  children: ReactNode
  dock: PlayDockProps
  trophyNotice: TrophyNotice | null
  friends: PlayFriendsState
  tables: PlayLobbyCard[]
}) => {
  useBareShell(true)
  const reward = usePlayReward(dock.profile)
  const path = usePathname()
  const isHub = path === ROUTES.play
  // The administration is a room of its own, sidebar instead of the bar
  const isAdmin = path.startsWith(ROUTES.playAdmin)
  const isLight = usePlayMotionStore((state) => state.isLight)

  return (
    <PlayOnlineProvider sessionId={dock.presence?.sessionId ?? null}>
      <div className={PLAY_SHELL.room} data-light={isLight || undefined}>
        <div className={PLAY_SHELL.floor} aria-hidden="true" />
        {isAdmin ? (
          <PlayAdminRoom>{children}</PlayAdminRoom>
        ) : (
          <>
            <PlayRoomBanner />
            <PlayDeskBar
              invites={dock.invites}
              presence={dock.presence}
              groupCalls={dock.groupCalls}
            />
            <div className={PLAY_SHELL.body}>
              <div className={PLAY_SHELL.content}>
                {isHub ? (
                  <div className={PLAY_SHELL.withAside}>
                    <PlaySlide>{children}</PlaySlide>
                  </div>
                ) : (
                  <PlaySlide>{children}</PlaySlide>
                )}
              </div>
              <PlayFriendsPanel
                state={friends}
                tables={tables}
                presence={dock.presence}
                isLocked={Boolean(dock.profile.ban)}
              />
            </div>
          </>
        )}
        <PlaySignal topic={PLAY_TOPICS.notices} />
        <PlaySignal topic={PLAY_TOPICS.groups} />
        {!isAdmin && (
          <PlayTabBar
            invites={dock.invites}
            presence={dock.presence}
            groupCalls={dock.groupCalls}
          />
        )}
        <PlayReward reward={reward} />
        <PlayCelebration />
        <PlayCardHost />
        <PlayTrophyNotice notice={trophyNotice} />
        <PlayInviteHost isPlay />
        <PlayBusyToast />
      </div>
    </PlayOnlineProvider>
  )
}
