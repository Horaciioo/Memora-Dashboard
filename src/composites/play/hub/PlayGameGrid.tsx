import { PlayGameCard } from '@/composites/play/hub/PlayGameCard'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

// Quarters around the featured one, in reading order
const QUARTERS = [PLAY_CROSS.topRight, PLAY_CROSS.bottomLeft, PLAY_CROSS.bottomRight]

export interface PlayGameGridProps {
  games: { game: PlayGameName; playable: boolean }[]
  // Games with a table waiting
  waiting: PlayGameName[]
}

/**
 * Games on a cross: the featured one top left, the rest shared by the three other quarters
 * @param {PlayGameGridProps} props - Catalogue and waiting tables
 * @return {JSX.Element}
 */

export const PlayGameGrid = ({ games, waiting }: PlayGameGridProps) => {
  const [featured, ...rest] = [...games].sort(
    (left, right) => Number(right.playable) - Number(left.playable)
  )
  const card = (entry: PlayGameGridProps['games'][number]) => (
    <PlayGameCard
      key={entry.game}
      {...entry}
      isWaiting={waiting.includes(entry.game)}
      className={PLAY_CROSS.card}
    />
  )

  return (
    <div className={PLAY_CROSS.cross}>
      <span className={PLAY_CROSS.lineV} aria-hidden="true" />
      <span className={PLAY_CROSS.lineH} aria-hidden="true" />
      {featured && (
        <div className={cn(PLAY_CROSS.quarter, PLAY_CROSS.featured)}>{card(featured)}</div>
      )}
      {QUARTERS.map((quarter, slot) => (
        <div key={quarter} className={cn(PLAY_CROSS.quarter, quarter)}>
          {rest.filter((_, index) => index % QUARTERS.length === slot).map(card)}
        </div>
      ))}
    </div>
  )
}
