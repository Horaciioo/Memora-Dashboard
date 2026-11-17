'use client'

import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PlayGameFeature } from '@/composites/play/hub/PlayGameFeature'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import { splitPlayGames } from '@/core/lib/play/hubGames'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'

export interface PlayGameGridProps {
  games: PlayHubGame[]
}

/**
 * Featured game on top, every game as a poster below
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games }: PlayGameGridProps) => {
  const { note, show } = usePlayNote()
  const onLocked = () => show(PLAY_HUB_COPY.mysterySoon)
  const { featured, rest } = splitPlayGames(games)

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
