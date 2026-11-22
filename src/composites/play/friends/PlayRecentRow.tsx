'use client'

import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_LAUNCHER_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayRecentRowProps {
  game: PlayGameName
  onOpen: () => void
  onForget: () => void
}

/**
 * Recent game: link, forget cross, right click menu
 * @param {PlayRecentRowProps} props - Game and handlers
 * @return {JSX.Element}
 */

export const PlayRecentRow = ({ game, onOpen, onForget }: PlayRecentRowProps) => {
  const { contextMenu } = useMenu()
  const meta = PLAY_GAMES.get(game)
  const Cross = ICONS.playClose
  const Next = ICONS.playNext

  return (
    <div
      className={PLAY_FRIENDS.recent}
      style={{ '--game': `var(${meta.tone})` } as CSSProperties}
      onContextMenu={contextMenu([
        {
          id: 'forget',
          label: PLAY_LAUNCHER_COPY.forget,
          icon: 'remove',
          danger: true,
          onSelect: onForget,
        },
      ])}
    >
      <AppLink
        href={ROUTES.playGame(meta.slug)}
        className={PLAY_FRIENDS.recentLink}
        onClick={onOpen}
      >
        <PlayGameLogo game={game} className={PLAY_FRIENDS.recentLogo} />
        <span className={PLAY_FRIENDS.recentName}>{meta.label}</span>
        <Next className={PLAY_FRIENDS.recentGlyph} aria-hidden="true" />
      </AppLink>
      <button
        type="button"
        aria-label={PLAY_LAUNCHER_COPY.forget}
        title={PLAY_LAUNCHER_COPY.forget}
        className={PLAY_FRIENDS.recentForget}
        onClick={onForget}
      >
        <Cross className={PLAY_FRIENDS.recentGlyph} aria-hidden="true" />
      </button>
    </div>
  )
}
