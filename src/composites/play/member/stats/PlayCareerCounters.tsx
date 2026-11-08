import { playTime } from '@/composites/play/member/stats/PlayStatTiles'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

/**
 * Four big counters
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Own totals
 * @return {JSX.Element}
 */

export const PlayCareerCounters = ({ totals }: { totals: PlayTileTotals }) => {
  const counters = [
    { label: PLAY_HUB_COPY.statPlayed, value: totals.played, icon: ICONS.play },
    { label: PLAY_HUB_COPY.statStreak, value: totals.bestStreak, icon: ICONS.playFlame },
    { label: PLAY_HUB_COPY.statTournaments, value: totals.tournamentsWon, icon: ICONS.playTrophy },
    { label: PLAY_HUB_COPY.statTime, value: playTime(totals.playSeconds), icon: ICONS.playClock },
  ]

  return (
    <dl className={PLAY_CAREER.counters}>
      {counters.map(({ label, value, icon: Icon }) => (
        <div key={label} className={PLAY_CAREER.counter}>
          <span className={PLAY_CAREER.counterIcon}>
            <Icon className={PLAY_CAREER.counterGlyph} aria-hidden="true" />
          </span>
          <span className={PLAY_CAREER.counterBody}>
            <dt className={PLAY_CAREER.counterLabel}>{label}</dt>
            <dd className={PLAY_CAREER.counterValue}>{value}</dd>
          </span>
        </div>
      ))}
    </dl>
  )
}
