import { PlayLevelBar } from '@/composites/play/member/stats/PlayLevelBar'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_HUB_COPY, tierOf } from '@/declarations/play'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayTotalsView } from '@/types/play'

/**
 * Global level, rank band and XP left
 * @param {Object} props - Totals
 * @param {PlayTotalsView} props.totals - Global totals
 * @return {JSX.Element}
 */

export const PlayDockPlayer = ({ totals }: { totals: PlayTotalsView }) => {
  const { level } = totals

  return (
    <div className={PLAY_DOCK.row}>
      <span className={PLAY_DOCK.rowHead}>
        <span className={PLAY_DOCK.rowName}>{tierOf(level.level).tier.label}</span>
        <span className={PLAY_DOCK.rowValue}>
          {fillPlayMessage(PLAY_HUB_COPY.level, { level: level.level })}
        </span>
      </span>
      <PlayLevelBar share={levelShare(level)} isThin />
      <span className={PLAY_DOCK.rowNote}>
        {level.needed
          ? fillPlayMessage(PLAY_HUB_COPY.toNext, {
              left: level.needed - level.into,
              next: level.level + 1,
            })
          : PLAY_HUB_COPY.maxed}
      </span>
    </div>
  )
}
