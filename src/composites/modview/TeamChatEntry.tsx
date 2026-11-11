'use client'

import { PanelButton } from '@/composites/modview/SidebarPanelButton'
import { TeamChatPanel } from '@/composites/modview/TeamChatPanel'
import { useTeamChatAlerts } from '@/core/hooks/data/lives/useTeamChatAlerts'
import { canSeeScope } from '@/core/lib/lives/teamChat'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { TEAM_CHAT_COPY as COPY, TEAM_CHAT_SCOPES } from '@/declarations/lives/teamChat'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'

export interface TeamChatEntryProps {
  liveId: string
  viewerId: string
  seats: MentionSeats
  isOpen: boolean
  onToggle: () => void
  isLocked?: boolean
}

/**
 * Sidebar entry of the internal chat, with unread point and mention bubble
 * @param {TeamChatEntryProps} props - Entry props
 * @return {JSX.Element}
 */

export const TeamChatEntry = ({
  liveId,
  viewerId,
  seats,
  isOpen,
  onToggle,
  isLocked = false,
}: TeamChatEntryProps) => {
  const me = seats.members.find((member) => member.id === viewerId)
  const scopes = TEAM_CHAT_SCOPES.filter((scope) => canSeeScope(me, scope))
  const { chat, hasUnread, bubble, mention, dismiss } = useTeamChatAlerts({
    liveId,
    viewerId,
    seats,
    isOpen,
    scopes,
  })
  const author = seats.members.find((member) => member.id === bubble?.authorId)
  const caller = seats.members.find((member) => member.id === mention?.authorId)

  return (
    <PanelButton
      icon="teamChat"
      label={COPY.title}
      isOpen={isOpen}
      onToggle={onToggle}
      anchor="top"
      isWide
      hasUnread={hasUnread}
      hint={
        mention
          ? COPY.mentionedTip.replace('{author}', caller?.name ?? COPY.unknown)
          : undefined
      }
      floating={
        bubble && (
          <button
            type="button"
            className={STYLES.popup}
            onClick={() => {
              dismiss()
              onToggle()
            }}
          >
            <span className={STYLES.bubbleTitle}>
              {COPY.mentioned.replace('{author}', author?.name ?? COPY.unknown)}
            </span>
            <span className={STYLES.bubbleBody}>{bubble.body}</span>
          </button>
        )
      }
    >
      <TeamChatPanel
        chat={chat}
        viewerId={viewerId}
        seats={seats}
        scopes={scopes}
        isLocked={isLocked}
      />
    </PanelButton>
  )
}
