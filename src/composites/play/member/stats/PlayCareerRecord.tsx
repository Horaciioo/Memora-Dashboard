import { fillPlayMessage, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayTileTotals } from '@/types/play'

// Gauge circle
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Win rate gauge, outcomes bar
 * @param {Object} props - Totals
 * @param {PlayTileTotals} props.totals - Own totals
 * @return {JSX.Element}
 */

export const PlayCareerRecord = ({ totals }: { totals: PlayTileTotals }) => {
  const rate = Math.round(
    (totals.winRate ?? (totals.played ? totals.wins / totals.played : 0)) * 100
  )
  const outcomes = [
    {
      key: 'win',
      value: totals.wins,
      label: PLAY_HUB_COPY.recordWins,
      bar: PLAY_CAREER.outcomeWin,
    },
    {
      key: 'draw',
      value: totals.draws,
      label: PLAY_HUB_COPY.recordDraws,
      bar: PLAY_CAREER.outcomeDraw,
    },
    {
      key: 'loss',
      value: totals.losses,
      label: PLAY_HUB_COPY.recordLosses,
      bar: PLAY_CAREER.outcomeLoss,
    },
  ]

  return (
    <section className={PLAY_CAREER.record}>
      <div className={PLAY_CAREER.recordTop}>
        <div className={PLAY_CAREER.gauge}>
          <svg viewBox="0 0 120 120" className={PLAY_CAREER.gaugeSvg} aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              strokeWidth="12"
              className={PLAY_CAREER.gaugeTrack}
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - rate / 100)}
              className={PLAY_CAREER.gaugeFill}
            />
          </svg>
          <div className={PLAY_CAREER.gaugeText}>
            <span className={PLAY_CAREER.gaugeValue}>
              {fillPlayMessage(PLAY_HUB_COPY.percent, { value: rate })}
            </span>
            <span className={PLAY_CAREER.gaugeLabel}>{PLAY_HUB_COPY.winRate}</span>
          </div>
        </div>

        <div className={PLAY_CAREER.outcomes}>
          <div className={PLAY_CAREER.outcomeBar} aria-hidden="true">
            {outcomes
              .filter((outcome) => outcome.value > 0)
              .map((outcome) => (
                <span
                  key={outcome.key}
                  className={outcome.bar}
                  style={{ flexGrow: outcome.value }}
                />
              ))}
          </div>
          <dl className={PLAY_CAREER.legend}>
            {outcomes.map((outcome) => (
              <div key={outcome.key} className={PLAY_CAREER.legendItem}>
                <span className={`${PLAY_CAREER.legendKey} ${outcome.bar}`} aria-hidden="true" />
                <dd className={PLAY_CAREER.legendValue}>{outcome.value}</dd>
                <dt className={PLAY_CAREER.legendLabel}>{outcome.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
