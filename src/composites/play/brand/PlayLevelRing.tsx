import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import type { AvatarProps } from '@/components/elements/display/Avatar'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_RING } from '@/declarations/ui/variants'
import type { PlayLevelView } from '@/types/play'

export interface PlayLevelRingProps {
  player: { name: string; avatarUrl: string | null }
  level: PlayLevelView
  size: AvatarProps['size']
  // Colour token of the ring, gold when empty
  tone?: string
}

/**
 * Avatar circled by its level progress
 * @param {PlayLevelRingProps} props - Player and level
 * @return {JSX.Element}
 */

export const PlayLevelRing = ({ player, level, size, tone }: PlayLevelRingProps) => (
  <span
    className={PLAY_RING.root}
    style={
      {
        '--share': `${levelShare(level)}%`,
        ...(tone && { '--ring': `var(${tone})` }),
      } as CSSProperties
    }
  >
    <Avatar name={player.name} src={player.avatarUrl} size={size} className={PLAY_RING.face} />
    <span className={PLAY_RING.level}>
      {fillPlayMessage(PLAY_HUB_COPY.level, { level: level.level })}
    </span>
  </span>
)
