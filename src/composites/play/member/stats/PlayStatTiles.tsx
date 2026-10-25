import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'
import { HOUR_SECONDS, MINUTE_SECONDS } from '@/utils/constants/time'

/**
 * Time played, hours past the hour
 * @param {number} seconds - Seconds
 * @return {string} - Duration
 */

const playTime = (seconds: number): string => {
  const hours = Math.floor(seconds / HOUR_SECONDS)
  const minutes = Math.floor((seconds % HOUR_SECONDS) / MINUTE_SECONDS)

  return hours
    ? fillPlayMessage(PLAY_HUB_COPY.hours, { hours, minutes: String(minutes).padStart(2, '0') })
    : fillPlayMessage(PLAY_HUB_COPY.minutes, { minutes })
}

/**
 * Wins, draws and losses on one line
 * @param {PlayTileTotals} totals - Totals
 * @return {string} - Record
 */

export const recordOf = ({ wins, draws, losses }: PlayTileTotals): string =>
  [wins, draws, losses].join(' - ')

/**
 * Six figures of a player, label and value
 * @param {PlayTileTotals} totals - Totals
 * @return {{ label: string, value: string | number }[]} - Figures
 */

export const figuresOf = (totals: PlayTileTotals): { label: string; value: string | number }[] => [
  { label: PLAY_HUB_COPY.statPlayed, value: totals.played },
  {
    label: PLAY_HUB_COPY.statWinRate,
    value: fillPlayMessage(PLAY_HUB_COPY.percent, {
      value: Math.round((totals.winRate ?? 0) * 100),
    }),
  },
  { label: PLAY_HUB_COPY.statRecord, value: recordOf(totals) },
  { label: PLAY_HUB_COPY.statStreak, value: totals.bestStreak },
  { label: PLAY_HUB_COPY.statTournaments, value: totals.tournamentsWon },
  { label: PLAY_HUB_COPY.statTime, value: playTime(totals.playSeconds) },
]

/**
 * Six figures of a player, global or for one game
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Totals
 * @return {JSX.Element}
 */

export const PlayStatTiles = ({ totals }: { totals: PlayTileTotals }) => (
  <div className={PLAY_STATS.tiles}>
    {figuresOf(totals).map((tile) => (
      <div key={tile.label} className={PLAY_STATS.tile}>
        <span className={PLAY_STATS.tileValue}>{tile.value}</span>
        <span className={PLAY_STATS.tileLabel}>{tile.label}</span>
      </div>
    ))}
  </div>
)
