import { BilanActivity } from '@/composites/lives/bilan/BilanActivity'
import { BilanBreakdown } from '@/composites/lives/bilan/BilanBreakdown'
import { BilanExports } from '@/composites/lives/bilan/BilanExports'
import { BilanFigures } from '@/composites/lives/bilan/BilanFigures'
import { BilanLevels } from '@/composites/lives/bilan/BilanLevels'
import { BilanVersus } from '@/composites/lives/bilan/BilanVersus'
import { bilanFigures } from '@/core/lib/lives/bilanFigures'
import type { LiveBaseline, LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface CreatorBilanProps {
  report: LiveReport
  insights: LiveInsights
  baseline: LiveBaseline | null
  start: string
  end: string
  stem: string
}

/**
 * Charts and downloads of the creator Bilan, without viewer names or messages
 * @param {CreatorBilanProps} props - Bilan data
 * @return {JSX.Element}
 */

export const CreatorBilan = ({
  report,
  insights,
  baseline,
  start,
  end,
  stem,
}: CreatorBilanProps) => {
  const durationSeconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))
  const figures = bilanFigures(report, insights, durationSeconds)

  return (
    <div className={LIVE_REPORT.wrapper}>
      <BilanFigures figures={figures} />
      <BilanActivity insights={insights} levels={report.levels} start={start} end={end} />
      <BilanVersus
        insights={insights}
        baseline={baseline}
        actions={report.actions}
        durationSeconds={durationSeconds}
      />
      <BilanBreakdown insights={insights} byKind={report.byKind} withDetail={false} />
      <BilanLevels levels={insights.levels} />
      <BilanExports stem={stem} figures={figures} insights={insights} />
    </div>
  )
}
