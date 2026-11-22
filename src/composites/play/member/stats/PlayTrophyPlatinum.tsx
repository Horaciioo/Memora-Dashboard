import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { fillPlayMessage, PLAY_HEAD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Platinum card: progress over the whole collection
 * @param {Object} props - Counts
 * @param {number} props.won - Trophies won
 * @param {number} props.total - Trophies in the collection
 * @return {JSX.Element}
 */

export const PlayTrophyPlatinum = ({ won, total }: { won: number; total: number }) => {
  const Crown = ICONS.playCrown
  const isPlatinum = won === total

  return (
    <div className={cn(PLAY_SHOWCASE.platinum, isPlatinum && PLAY_SHOWCASE.platinumOn)}>
      <span className={cn(PLAY_SHOWCASE.platinumIcon, isPlatinum && PLAY_SHOWCASE.platinumIconOn)}>
        <Crown className={PLAY_SHOWCASE.platinumGlyph} aria-hidden="true" />
      </span>
      <span className={PLAY_SHOWCASE.platinumText}>
        <span className={PLAY_SHOWCASE.platinumName}>{PLAY_HEAD_COPY.platinum}</span>
        <span className={PLAY_SHOWCASE.platinumGoal}>
          {isPlatinum
            ? PLAY_HEAD_COPY.platinumGoal
            : fillPlayMessage(PLAY_HEAD_COPY.platinumLeft, { left: total - won })}
        </span>
        <PlayLevelBar share={(won / total) * 100} isThin />
      </span>
    </div>
  )
}
