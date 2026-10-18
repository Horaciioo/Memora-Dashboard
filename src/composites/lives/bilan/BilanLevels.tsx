import { Section } from '@/components/structures/page/Section'
import type { LiveInsights } from '@/core/lib/lives/insights'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVECON_FRISE_COLOURS, LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { CHART, LIVE_REPORT } from '@/declarations/ui/variants'
import { RankBars } from '@/components/structures/charts/RankBars'

export interface BilanLevelsProps {
  levels: LiveInsights['levels']
}

/**
 * Rhythm of the team under each Livecon level
 * @param {LiveInsights['levels']} levels - Rows
 * @return {JSX.Element}
 */

export const BilanLevels = ({ levels }: BilanLevelsProps) => (
  <Section title={BILAN_COPY.levelsTitle} description={BILAN_COPY.levelsLead} padded>
    {levels.length === 0 ? (
      <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.levelsEmpty}</p>
    ) : (
      <div className={CHART.root}>
        <RankBars
          empty={LIVE_REPORT_COPY.levelsEmpty}
          rows={levels.map((level) => ({
            label: level.name,
            detail: BILAN_COPY.levelRow
              .replace('{minutes}', String(level.minutes))
              .replace('{actions}', String(level.actions))
              .replace('{rate}', String(Math.round(level.perHour * 10) / 10)),
            value: Math.round(level.perHour * 10) / 10,
            colour: LIVECON_FRISE_COLOURS[level.level],
          }))}
        />
      </div>
    )}
  </Section>
)
