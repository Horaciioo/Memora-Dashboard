import { TrendMark } from '@/composites/lives/hub/TrendMark'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveHubFigure } from '@/types/lives'
import { roughDuration } from '@/utils/format/time/hours'

// Figure said as the card prints it
const say = (figure: LiveHubFigure, value: number): string =>
  figure.key === 'time' ? (value === 0 ? '0 min' : roughDuration(value / 60)) : String(value)

/**
 * Four figures of the member, each with its arrow
 * @param {{ figures: LiveHubFigure[] }} props - Figures of the creator
 * @return {JSX.Element}
 */

export const LiveHubStats = ({ figures }: { figures: LiveHubFigure[] }) => (
  <section aria-label={LIVE_HUB_COPY.periodNote} className="flex flex-col gap-3">
    <div className={LIVE_HUB_STYLES.stats}>
      {figures.map((figure) => (
        <div key={figure.key} className={LIVE_HUB_STYLES.stat}>
          <span className={LIVE_HUB_STYLES.statLabel}>{LIVE_HUB_COPY[figure.key]}</span>
          <span className={LIVE_HUB_STYLES.statRow}>
            <span className={LIVE_HUB_STYLES.statValue}>{say(figure, figure.value)}</span>
            <TrendMark value={figure.value} previous={figure.previous} />
          </span>
        </div>
      ))}
    </div>
    <p className={LIVE_HUB_STYLES.note}>{LIVE_HUB_COPY.periodNote}</p>
  </section>
)
