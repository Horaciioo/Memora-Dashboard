import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface PlayAdminGroupProps {
  name: string
  avatarUrl?: string | null
  bannerUrl?: string | null
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

/**
 * Creator box: photo banner, its players unfold beneath
 * @param {PlayAdminGroupProps} props - Creator, fold state and players
 * @return {JSX.Element}
 */

export const PlayAdminGroup = ({
  name,
  avatarUrl,
  bannerUrl,
  isOpen,
  onToggle,
  children,
}: PlayAdminGroupProps) => {
  const Chevron = ICONS.expand
  const backdrop = bannerUrl ?? avatarUrl

  return (
    <section className={PLAY_ADMIN.group}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={PLAY_ADMIN.groupBanner}
      >
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" loading="lazy" className={PLAY_ADMIN.groupBackdrop} />
        )}
        <span className={PLAY_ADMIN.groupWash} aria-hidden="true" />
        {avatarUrl && (
          <Avatar name={name} src={avatarUrl} size="md" className={PLAY_ADMIN.groupPortrait} />
        )}
        <h2 className={PLAY_ADMIN.groupName}>{name}</h2>
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
          <div className={isOpen ? PLAY_ADMIN.groupBoxOpen : PLAY_ADMIN.groupBox}>{children}</div>
        </div>
      </div>
    </section>
  )
}
