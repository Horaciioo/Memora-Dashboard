'use client'

import { PanelButton } from '@/composites/modview/SidebarPanelButton'
import { TeamChatPanel } from '@/composites/modview/TeamChatPanel'
import { useTeamChatAlerts } from '@/core/hooks/data/lives/useTeamChatAlerts'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { TEAM_CHAT_COPY as COPY } from '@/declarations/lives/teamChat'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'

export interface TeamChatEntryProps {
  liveId: string
  viewerId: string
  seats: MentionSeats
  isOpen: boolean
  onToggle: () => void
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
}: TeamChatEntryProps) => {
  const { chat, hasUnread, bubble, dismiss } = useTeamChatAlerts({
    liveId,
    viewerId,
    seats,
    isOpen,
  })
  const author = seats.members.find((member) => member.id === bubble?.authorId)

  return (
    <PanelButton
      icon="chat"
      label={COPY.title}
      isOpen={isOpen}
      onToggle={onToggle}
      anchor="top"
      isWide
      hasUnread={hasUnread}
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
      <TeamChatPanel chat={chat} viewerId={viewerId} seats={seats} />
    </PanelButton>
  )
}
