import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { legendOf } from '@/declarations/sanctions/measures'
import { accentVars } from '@/declarations/ui/theme'
import { SANCTION_LEGEND } from '@/declarations/ui/variants'
import type { SanctionPanelName } from '@/utils/constants/moderation'

export interface SanctionLegendProps {
  panel: SanctionPanelName
}

/**
 * Measures of a surface by severity
 * @param {SanctionPanelName} panel - Surface
 * @return {JSX.Element}
 */

export const SanctionLegend = ({ panel }: SanctionLegendProps) => (
  <section className={SANCTION_LEGEND.root} aria-label={SANCTION_COPY.legendTitle}>
    <h2 className={SANCTION_LEGEND.title}>{SANCTION_COPY.legendTitle}</h2>
    <ul className={SANCTION_LEGEND.list}>
      {legendOf(panel).map((measure) => (
        <li key={measure.name} className={SANCTION_LEGEND.item} style={accentVars(measure.accent)}>
          {measure.name}
        </li>
      ))}
    </ul>
  </section>
)
