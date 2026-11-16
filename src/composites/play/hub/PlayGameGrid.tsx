'use client'

import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PlayGameFeature } from '@/composites/play/hub/PlayGameFeature'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import { PLAY_GAMES, PLAY_HUB_COPY, PLAY_FEATURED_GAMES } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
}

/**
 * Featured game on top, every game as a poster below
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games }: PlayGameGridProps) => {
  const { note, show } = usePlayNote()
  const onLocked = () => show(PLAY_HUB_COPY.mysterySoon)
  const featured = games
    .filter((entry) => entry.playable && PLAY_FEATURED_GAMES.includes(entry.game))
    .map((entry) => entry.game)
  const rest = games
    .filter((entry) => !featured.includes(entry.game))
    .sort(
      (a, b) =>
        Number(b.playable) - Number(a.playable) ||
        PLAY_GAMES.get(a.game).label.localeCompare(PLAY_GAMES.get(b.game).label, 'fr'),
    )

  return (
    <div className={PLAY_CROSS.wall}>
      <PlayGameFeature games={featured} />
      <h2 className={PLAY_CROSS.wallTitle}>{PLAY_HUB_COPY.allGames}</h2>
      <div className={PLAY_CROSS.tiles}>
        {rest.map((entry) => (
          <PlayGameCard
            key={entry.game}
            {...entry}
            onLocked={onLocked}
            className={PLAY_CROSS.tile}
          />
        ))}
      </div>
      <PlayNote text={note} />
    </div>
  )
}
