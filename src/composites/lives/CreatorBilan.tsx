import { BilanActivity } from '@/composites/lives/bilan/BilanActivity'
import { BilanBreakdown } from '@/composites/lives/bilan/BilanBreakdown'
import { BilanExports } from '@/composites/lives/bilan/BilanExports'
import { CreatorStory } from '@/composites/lives/bilan/creator/CreatorStory'
import { CreatorHero } from '@/composites/lives/bilan/creator/CreatorHero'
import { CreatorNumbers } from '@/composites/lives/bilan/creator/CreatorNumbers'
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
  creator: { name: string; avatar: string | null; banner: string | null }
}

/**
 * Creator bilan: poster, giant numbers, lede, charts and downloads, without viewer names or messages
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
  creator,
}: CreatorBilanProps) => {
  const durationSeconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))
  const figures = bilanFigures(report, insights, durationSeconds)

  return (
    <div className={LIVE_REPORT.wrapper}>
      <CreatorHero creator={creator} start={start} />
      <CreatorNumbers figures={figures} />
      <CreatorStory report={report} start={start} end={end} />
      <BilanActivity insights={insights} levels={report.levels} start={start} end={end} />
      <BilanVersus
        insights={insights}
        baseline={baseline}
        actions={report.actions}
        durationSeconds={durationSeconds}
      />
      <BilanBreakdown insights={insights} byKind={report.byKind} withDetail={false} />
      {/* Only a change of level is worth a section */}
      {report.levels.length > 1 && <BilanLevels levels={insights.levels} />}
      <BilanExports stem={stem} figures={figures} insights={insights} />
    </div>
  )
}
