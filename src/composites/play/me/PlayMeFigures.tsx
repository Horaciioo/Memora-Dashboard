import { figuresOf } from '@/composites/play/member/stats/PlayStatTiles'
import type { PlayFigureId } from '@/composites/play/member/stats/PlayStatTiles'
import { PLAY_ME } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'
import { cn } from '@/utils/classnames'

// Figures kept, the record closing the board
const SIDEBAR_FIGURES: PlayFigureId[] = ['played', 'winRate', 'streak', 'time', 'record']

// Figure spanning the full width
const WIDE_FIGURE: PlayFigureId = 'record'

/**
 * Figures of the player, value over label, no icon
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Totals
 * @return {JSX.Element}
 */

export const PlayMeFigures = ({ totals }: { totals: PlayTileTotals }) => {
  const all = figuresOf(totals)

  return (
    <div className={PLAY_ME.figures}>
      {SIDEBAR_FIGURES.flatMap((id) => all.filter((figure) => figure.id === id)).map((figure) => (
        <div
          key={figure.id}
          className={cn(PLAY_ME.figure, figure.id === WIDE_FIGURE && PLAY_ME.figureWide)}
        >
          <span className={PLAY_ME.figureValue}>{figure.value}</span>
          <span className={PLAY_ME.figureLabel}>{figure.label}</span>
        </div>
      ))}
    </div>
  )
}
