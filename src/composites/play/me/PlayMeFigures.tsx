import { figuresOf } from '@/composites/play/member/stats/PlayStatTiles'
import type { PlayFigureId } from '@/composites/play/member/stats/PlayStatTiles'
import { PLAY_ME_COPY } from '@/declarations/play'
import { PLAY_CAREER, PLAY_ME } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'
import { cn } from '@/utils/classnames'

// Figures kept as tiles
const SIDEBAR_FIGURES: PlayFigureId[] = ['played', 'winRate', 'streak', 'time']

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
        <div key={figure.id} className={PLAY_ME.figure}>
          <span className={PLAY_ME.figureValue}>{figure.value}</span>
          <span className={PLAY_ME.figureLabel}>{figure.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Wins, draws and losses, one tile
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Totals
 * @return {JSX.Element}
 */

export const PlayMeRecord = ({ totals }: { totals: PlayTileTotals }) => {
  const columns = [
    { key: 'wins', value: totals.wins, label: PLAY_ME_COPY.recordWins, tone: PLAY_CAREER.toneWin },
    {
      key: 'draws',
      value: totals.draws,
      label: PLAY_ME_COPY.recordDraws,
      tone: PLAY_CAREER.toneDraw,
    },
    {
      key: 'losses',
      value: totals.losses,
      label: PLAY_ME_COPY.recordLosses,
      tone: PLAY_CAREER.toneLoss,
    },
  ]

  return (
    <div className={PLAY_ME.tile}>
      {columns.map(({ key, value, label, tone }) => (
        <div key={key} className={PLAY_ME.recordColumn}>
          <span className={cn(PLAY_ME.record, tone)}>{value}</span>
          <span className={cn(PLAY_ME.figureLabel, 'leading-none')}>{label}</span>
        </div>
      ))}
    </div>
  )
}
