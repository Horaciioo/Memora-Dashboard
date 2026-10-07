'use client'

import { FunctionEmblems } from '@/composites/members/MemberBadges'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIST_STYLES } from '@/declarations/ui/variants'
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
 * Moderator box
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
  const AbsentIcon = ICONS.absences
  const NotesIcon = ICONS.note

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
        member.isAbsent && LIST_STYLES.cardAbsent
      )}
    >
      <span className="flex min-w-0 flex-1">
        <span
          className={cn(
            'flex min-w-0 items-center gap-1.5 truncate font-medium',
            member.isAbsent && LIST_STYLES.cardAbsentName
          )}
        >
          <span className="truncate">{member.displayName}</span>
          {showNotesBubble && member.notesCount > 0 && (
            <span title={MEMBER_COPY.notesTitle} className="inline-flex">
              <NotesIcon className={LIST_STYLES.cardNotes} />
              <span className="sr-only">{MEMBER_COPY.notesTitle}</span>
            </span>
          )}
          {member.isAbsent && (
            <span className={LIST_STYLES.cardAbsentNote}>
              <AbsentIcon className={LIST_STYLES.cardAbsentGlyph} aria-hidden="true" />
              {MEMBER_COPY.absent}
            </span>
          )}
        </span>
      </span>
      <FunctionEmblems
        member={member}
        className={cn('gap-1', member.isAbsent && LIST_STYLES.cardAbsentEmblems)}
        glyphClassName="h-5 w-5"
      />
    </div>
  )
}
