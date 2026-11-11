import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { TrendMark } from '@/composites/lives/hub/TrendMark'
import { LIVE_HUB_COPY, LIVE_HUB_FIGURE_ICONS } from '@/declarations/lives/hub'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveHubFigure } from '@/types/lives'
import { roughDuration } from '@/utils/format/time/hours'

// Figure said as the card prints it
const say = (figure: LiveHubFigure): string =>
  figure.key === 'time'
    ? figure.value === 0
      ? '0 min'
      : roughDuration(figure.value / 60)
    : String(figure.value)

/**
 * Member's figures, then the team's own
 * @param {{ figures: LiveHubFigure[], team: LiveHubFigure[] }} props - Figures of the member and of the team
 * @return {JSX.Element}
 */

export const LiveHubStats = ({
  figures,
  team,
}: {
  figures: LiveHubFigure[]
  team: LiveHubFigure[]
}) => {
  return (
    <section className="flex flex-col gap-3">
      <div className={LIVE_HUB_STYLES.groups}>
        <div className={LIVE_HUB_STYLES.group}>
          <h2 className={LIVE_HUB_STYLES.groupTitle}>
            {LIVE_HUB_COPY.personalTitle}
            <InfoHint text={LIVE_HUB_COPY.periodNote} align="start" />
          </h2>
          <div className={LIVE_HUB_STYLES.stats}>
            {figures.map((figure) => {
              const Icon = ICONS[LIVE_HUB_FIGURE_ICONS[figure.key]]

              return (
                <div key={figure.key} className={LIVE_HUB_STYLES.stat}>
                  <span className={LIVE_HUB_STYLES.statHead}>
                    <span className={LIVE_HUB_STYLES.statChip}>
                      <Icon className={LIVE_HUB_STYLES.statGlyph} aria-hidden="true" />
                    </span>
                    <span className={LIVE_HUB_STYLES.statLabel}>{LIVE_HUB_COPY[figure.key]}</span>
                  </span>
                  <span className={LIVE_HUB_STYLES.statRow}>
                    <span className={LIVE_HUB_STYLES.statValue}>{say(figure)}</span>
                    <TrendMark value={figure.value} previous={figure.previous} />
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={LIVE_HUB_STYLES.group}>
          <h2 className={LIVE_HUB_STYLES.groupTitle}>
            {LIVE_HUB_COPY.teamTitle}
            <InfoHint text={LIVE_HUB_COPY.periodNote} align="start" />
          </h2>
          <div className={LIVE_HUB_STYLES.teamCard}>
            {team.map((figure) => {
              const Icon = ICONS[LIVE_HUB_FIGURE_ICONS[figure.key]]

              return (
                <div key={figure.key} className={LIVE_HUB_STYLES.teamRow}>
                  <span className={LIVE_HUB_STYLES.statChip}>
                    <Icon className={LIVE_HUB_STYLES.statGlyph} aria-hidden="true" />
                  </span>
                  <span className={LIVE_HUB_STYLES.teamLabel}>{LIVE_HUB_COPY[figure.key]}</span>
                  <TrendMark value={figure.value} previous={figure.previous} />
                  <span className={LIVE_HUB_STYLES.teamValue}>{say(figure)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
