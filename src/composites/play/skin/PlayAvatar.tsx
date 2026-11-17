'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import { usePlayLevels } from '@/core/hooks/data/play/usePlayLevels'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'

export interface PlayAvatarProps {
  accountId: string
  name: string
  src?: string | null
  size?: Exclude<AvatarSize, 'hero'>
  className?: string
  title?: string
}

/**
 * Portrait of a player in the frame of their level, plain for a bot
 * @param {PlayAvatarProps} props - Player and size
 * @return {JSX.Element}
 */

export const PlayAvatar = ({
  accountId,
  name,
  src = null,
  size = 'sm',
  className,
  title,
}: PlayAvatarProps) => {
  const level = usePlayLevels()[accountId]

  if (level === undefined)
    return <Avatar name={name} src={src} size={size} className={className} title={title} />

  return (
    <span data-play-card={accountId} className="contents">
      <LevelFrame level={level} name={name} src={src} size={size} className={className} bleed />
    </span>
  )
}
