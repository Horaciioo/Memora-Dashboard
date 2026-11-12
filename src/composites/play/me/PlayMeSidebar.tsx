'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PlayMeDetails } from '@/composites/play/me/PlayMeDetails'
import { PlayMeLevel } from '@/composites/play/me/PlayMeLevel'
import { PLAY_ME_COPY, tierOf } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ME } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

export interface PlayMeSidebarProps {
  player: { name: string; avatarUrl: string | null }
  profile: PlayProfileView
}

/**
 * Right sidebar of the hub: photo and name fold the level, the stats follow under
 * @param {PlayMeSidebarProps} props - Player and stats
 * @return {JSX.Element}
 */

export const PlayMeSidebar = ({ player, profile }: PlayMeSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { level } = profile.global
  const { tier } = tierOf(level.level)
  const CaretIcon = ICONS.expand

  return (
    <aside className={PLAY_ME.aside}>
      <div className={PLAY_ME.card} style={{ '--tier': `var(${tier.tone})` } as CSSProperties}>
        <button
          type="button"
          aria-label={PLAY_ME_COPY.open}
          aria-expanded={isOpen}
          className={PLAY_ME.head}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Avatar name={player.name} src={player.avatarUrl} size="md" />
          <span className={PLAY_ME.name}>{player.name}</span>
          <CaretIcon className={PLAY_ME.caret} aria-hidden="true" />
        </button>
        {isOpen && <PlayMeLevel level={level} tier={tier} />}
      </div>
      {isOpen && <PlayMeDetails profile={profile} />}
    </aside>
  )
}
