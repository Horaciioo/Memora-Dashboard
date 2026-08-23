'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { GROUP_STYLES, LIST_STYLES } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { MemberSummary } from '@/types/members'
import { cn } from '@/utils/classnames'

export interface MemberCardProps {
  member: MemberSummary
  showNotesBubble: boolean
  canDelete: boolean
  onOpen: () => void
  onDelete: () => void
}

/**
 * Moderator box, name and identifier only, muted while an absence covers today
 * @param {MemberSummary} member - Row to show
 * @param {boolean} showNotesBubble - Reveal the notes indicator
 * @param {boolean} canDelete - Member may drop this moderator
 * @param {() => void} onOpen - Called on click and on Enter
 * @param {() => void} onDelete - Called from the right click menu
 * @return {JSX.Element}
 */

export const MemberCard = ({
  member,
  showNotesBubble,
  canDelete,
  onOpen,
  onDelete,
}: MemberCardProps) => {
  const { contextMenu } = useMenu()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen()
      }}
      onContextMenu={contextMenu([
        { id: 'open', label: ACTION_COPY.open, icon: 'forward', onSelect: onOpen },
        {
          id: 'copy',
          label: ACTION_COPY.copyId,
          icon: 'copy',
          onSelect: () => void navigator.clipboard.writeText(member.discordId),
        },
        {
          id: 'delete',
          label: ACTION_COPY.delete,
          icon: 'remove',
          danger: true,
          separatorBefore: true,
          disabled: !canDelete,
          onSelect: onDelete,
        },
      ])}
      className={cn(
        LIST_STYLES.card,
        LIST_STYLES.cardClickable,
        'flex-row items-center py-3',
        member.isAbsent && LIST_STYLES.cardMuted
      )}
    >
      <Avatar name={member.displayName} src={member.avatarUrl} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 truncate font-medium">
          <span className="truncate">{member.displayName}</span>
          {showNotesBubble && member.notesCount > 0 && (
            <span
              className={GROUP_STYLES.bubble}
              role="img"
              aria-label={MEMBER_COPY.notesTitle}
              title={MEMBER_COPY.notesTitle}
            />
          )}
        </span>
        <span className="truncate text-xs text-[var(--color-ink-subtle)]">{member.discordId}</span>
      </span>
    </div>
  )
}
