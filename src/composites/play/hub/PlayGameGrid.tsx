'use client'

import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PlayNote } from '@/composites/play/hub/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

// Secret poster completing the last row
const MYSTERY_COUNT = 1

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
}

/**
 * Games three by three, playable ones first, then the secret ones
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games }: PlayGameGridProps) => {
  const { note, show } = usePlayNote()
  const ordered = [...games].sort((left, right) => Number(right.playable) - Number(left.playable))
  const secret = Array.from({ length: MYSTERY_COUNT }, (_, index) => ({
    id: `mystery-${index}`,
    game: games[0].game,
  }))

  return (
    <div className={PLAY_CROSS.cross}>
      {ordered.map((entry) => (
        <PlayGameCard
          key={entry.game}
          {...entry}
          onLocked={() => show(PLAY_HUB_COPY.mysterySoon)}
          className={PLAY_CROSS.card}
        />
      ))}
      {secret.map((entry) => (
        <PlayGameCard
          key={entry.id}
          game={entry.game}
          playable={false}
          onLocked={() => show(PLAY_HUB_COPY.mysterySoon)}
          className={PLAY_CROSS.card}
        />
      ))}
      <PlayNote text={note} />
    </div>
  )
}
