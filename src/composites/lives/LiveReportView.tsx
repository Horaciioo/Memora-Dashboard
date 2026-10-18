import { BilanActivity } from '@/composites/lives/bilan/BilanActivity'
import { BilanBreakdown } from '@/composites/lives/bilan/BilanBreakdown'
import { BilanExports } from '@/composites/lives/bilan/BilanExports'
import { BilanFigures } from '@/composites/lives/bilan/BilanFigures'
import { BilanLevels } from '@/composites/lives/bilan/BilanLevels'
import { BilanLog } from '@/composites/lives/bilan/BilanLog'
import { BilanTeam } from '@/composites/lives/bilan/BilanTeam'
import { BilanVersus } from '@/composites/lives/bilan/BilanVersus'
import { bilanFigures } from '@/core/lib/lives/bilanFigures'
import type { LiveBaseline, LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine } from '@/types/lives'

export interface LiveReportViewProps {
  report: LiveReport
  insights: LiveInsights
  baseline: LiveBaseline | null
  log: LiveLogLine[]
  start: string
  end: string
  available: boolean
  // File name stem
  stem: string
}

/**
 * Bilan of a live for the team: figures, charts, comparison, team, log and downloads
 * @param {LiveReportViewProps} props - Bilan data
 * @return {JSX.Element}
 */

export const LiveReportView = ({
  report,
  insights,
  baseline,
  log,
  start,
  end,
  available,
  stem,
}: LiveReportViewProps) => {
  const durationSeconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))
  const figures = bilanFigures(report, insights, durationSeconds)

  return (
    <div className={LIVE_REPORT.wrapper}>
      {!available && <p className={LIVE_REPORT.notice}>{LIVE_REPORT_COPY.unavailable}</p>}

      <BilanFigures figures={figures} />
      <BilanActivity insights={insights} levels={report.levels} start={start} end={end} />
      <BilanVersus
        insights={insights}
        baseline={baseline}
        actions={report.actions}
        durationSeconds={durationSeconds}
      />
      <BilanTeam report={report} insights={insights} />
      <BilanBreakdown insights={insights} byKind={report.byKind} withDetail />
      <BilanLevels levels={insights.levels} />
      <BilanLog log={log} moderators={report.moderators} />
      <BilanExports stem={stem} figures={figures} insights={insights} log={log} />
    </div>
  )
}
