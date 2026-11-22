import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface PlayAdminGroupProps {
  name: string
  avatarUrl?: string | null
  // Players held, written beside the name
  note: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

/**
 * Creator box: its players unfold beneath
 * @param {PlayAdminGroupProps} props - Creator, fold state and players
 * @return {JSX.Element}
 */

export const PlayAdminGroup = ({
  name,
  avatarUrl,
  note,
  isOpen,
  onToggle,
  children,
}: PlayAdminGroupProps) => {
  const Chevron = ICONS.expand

  return (
    <section className={PLAY_ADMIN.group}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={PLAY_ADMIN.groupHead}
      >
        <Avatar name={name} src={avatarUrl ?? undefined} size="md" />
        <h2 className={PLAY_ADMIN.groupName}>{name}</h2>
        <span className={PLAY_ADMIN.groupNote}>{note}</span>
        <Chevron
          className={cn(PLAY_ADMIN.groupChevron, isOpen && PLAY_ADMIN.groupChevronOpen)}
          aria-hidden="true"
        />
      </button>
      <div
        className={isOpen ? PLAY_ADMIN.groupFoldOpen : PLAY_ADMIN.groupFold}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className={PLAY_ADMIN.groupClip}>
          <div className={isOpen ? PLAY_ADMIN.groupBodyOpen : PLAY_ADMIN.groupBody}>{children}</div>
        </div>
      </div>
    </section>
  )
}
