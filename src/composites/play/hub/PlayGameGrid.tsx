'use client'

import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PlayGameFeature } from '@/composites/play/hub/PlayGameFeature'
import { PlayGameCarousel } from '@/composites/play/hub/PlayGameCarousel'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import { PLAY_HUB_COPY, PLAY_FEATURED_GAMES } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
}

/**
 * Games in two rows, the new ones then the finished ones; a list on a phone
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games }: PlayGameGridProps) => {
  const { note, show } = usePlayNote()
  const onLocked = () => show(PLAY_HUB_COPY.mysterySoon)
  const featured = games
    .filter((entry) => entry.playable && PLAY_FEATURED_GAMES.includes(entry.game))
    .map((entry) => entry.game)

  return (
    <>
      <PlayGameFeature games={featured} />
      <PlayGameCarousel title={PLAY_HUB_COPY.allGames} games={games} onLocked={onLocked} />
      <div className={PLAY_CROSS.list}>
        {games.map((entry) => (
          <PlayGameCard
            key={entry.game}
            {...entry}
            onLocked={onLocked}
            className={PLAY_CROSS.card}
          />
        ))}
      </div>
      <PlayNote text={note} />
    </>
  )
}
