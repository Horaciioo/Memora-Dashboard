import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
}

/**
 * Games as a row of tall posters, playable ones first
 * @param {PlayGameGridProps} props - Catalogue
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games }: PlayGameGridProps) => (
  <div className={PLAY_CROSS.cross}>
    {[...games]
      .sort((left, right) => Number(right.playable) - Number(left.playable))
      .map((entry) => (
        <PlayGameCard key={entry.game} {...entry} className={PLAY_CROSS.card} />
      ))}
  </div>
)
