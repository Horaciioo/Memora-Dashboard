'use client'

import { useState } from 'react'

import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { LiveReinforcementEditor } from '@/composites/lives/coordination/LiveReinforcementEditor'
import type { TeamTools } from '@/composites/modview/memberMenu'
import { TeamChatPanel } from '@/composites/modview/TeamChatPanel'
import { TeamPanel } from '@/composites/modview/TeamPanel'
import { useTeamChatAlerts } from '@/core/hooks/data/lives/useTeamChatAlerts'
import { canSeeScope } from '@/core/lib/lives/teamChat'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { TEAM_CHAT_COPY, TEAM_CHAT_ENABLED, TEAM_CHAT_SCOPES } from '@/declarations/lives/teamChat'
import { MODVIEW_TEAM_COPY as TEAM_COPY } from '@/declarations/modview/watch'
import { MODVIEW_MOBILE, MODVIEW_TEAM_CHAT } from '@/declarations/ui/variants'
import type { LiveFocusView } from '@/types/lives'

export interface MobileTeamPageProps {
  liveId: string
  viewerId: string
  seats: MentionSeats
  isLocked: boolean
  isOpen: boolean
  tools: TeamTools
  focuses: LiveFocusView[]
  coordinatorIds: string[]
  canReinforce: boolean
  isRosterOpen: boolean
  onRosterClose: () => void
}

/**
 * Internal chat of the team, with the members present one touch away
 * @param {MobileTeamPageProps} props - Page props
 * @return {JSX.Element}
 */

export const MobileTeamPage = ({
  liveId,
  viewerId,
  seats,
  isLocked,
  isOpen,
  tools,
  focuses,
  coordinatorIds,
  canReinforce,
  isRosterOpen,
  onRosterClose,
}: MobileTeamPageProps) => {
  const [isReinforcing, setReinforcing] = useState(false)
  const me = seats.members.find((member) => member.id === viewerId)
  const scopes = TEAM_CHAT_SCOPES.filter((scope) => canSeeScope(me, scope))
  const { chat } = useTeamChatAlerts({ liveId, viewerId, seats, isOpen, scopes })

  return (
    <div className={MODVIEW_MOBILE.pageBody}>
      <div className={MODVIEW_MOBILE.teamBody}>
        <TeamChatPanel
          chat={chat}
          viewerId={viewerId}
          seats={seats}
          scopes={scopes}
          isLocked={isLocked}
          isFilling
        />
      </div>
      <BottomSheet open={isRosterOpen} onClose={onRosterClose} title={TEAM_COPY.title}>
        <TeamPanel
          liveId={liveId}
          tools={tools}
          focuses={focuses}
          coordinatorIds={coordinatorIds}
          canReinforce={canReinforce}
          onReinforce={() => {
            onRosterClose()
            setReinforcing(true)
          }}
        />
      </BottomSheet>
      <LiveReinforcementEditor
        liveId={liveId}
        open={isReinforcing}
        onClose={() => setReinforcing(false)}
      />
    </div>
  )
}

/**
 * Page shown when no real live holds the team
 * @return {JSX.Element}
 */

export const MobileTeamOffline = () => (
  <div className={MODVIEW_TEAM_CHAT.box}>
    <p className={MODVIEW_TEAM_CHAT.empty}>
      {TEAM_CHAT_ENABLED ? TEAM_CHAT_COPY.offline : TEAM_CHAT_COPY.rosterOffline}
    </p>
  </div>
)

/**
 * Team page while the internal chat is hidden: the roster alone
 * @param {MobileTeamPageProps} props - Page props
 * @return {JSX.Element}
 */

export const MobileRosterPage = ({
  liveId,
  tools,
  focuses,
  coordinatorIds,
  canReinforce,
}: MobileTeamPageProps) => {
  const [isReinforcing, setReinforcing] = useState(false)

  return (
    <div className={MODVIEW_MOBILE.pageBody}>
      <TeamPanel
        liveId={liveId}
        tools={tools}
        focuses={focuses}
        coordinatorIds={coordinatorIds}
        canReinforce={canReinforce}
        onReinforce={() => setReinforcing(true)}
      />
      <LiveReinforcementEditor
        liveId={liveId}
        open={isReinforcing}
        onClose={() => setReinforcing(false)}
      />
    </div>
  )
}
