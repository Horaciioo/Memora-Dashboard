'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { LiveEditProvider } from '@/composites/lives/LiveEditContext'
import { CreatorBilan } from '@/composites/lives/CreatorBilan'
import { BilanActivity } from '@/composites/lives/bilan/BilanActivity'
import { BilanBreakdown } from '@/composites/lives/bilan/BilanBreakdown'
import { BilanExports } from '@/composites/lives/bilan/BilanExports'
import { BilanFigures } from '@/composites/lives/bilan/BilanFigures'
import { BilanLevels } from '@/composites/lives/bilan/BilanLevels'
import { BilanModeration } from '@/composites/lives/bilan/moderation/BilanModeration'
import { BilanVersus } from '@/composites/lives/bilan/BilanVersus'
import { bilanFigures } from '@/core/lib/lives/bilanFigures'
import type { LiveBaseline, LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine, LiveModTime, LiveNote } from '@/types/lives'

export interface LiveReportViewProps {
  report: LiveReport
  insights: LiveInsights
  baseline: LiveBaseline | null
  log: LiveLogLine[]
  team: LiveModTime[]
  notes: LiveNote[]
  start: string
  end: string
  available: boolean
  // Administrators also read the creator's version
  showCreator: boolean
  creator: { name: string; avatar: string | null; banner: string | null }
  // File name stem
  stem: string
  liveId: string
  // Responsables correct the data
  canEdit: boolean
}

/**
 * Bilan of a live for the team: the general view, then the moderation one
 * @param {LiveReportViewProps} props - Bilan data
 * @return {JSX.Element}
 */

export const LiveReportView = ({
  report,
  insights,
  baseline,
  log,
  team,
  notes,
  start,
  end,
  available,
  showCreator,
  creator,
  stem,
  liveId,
  canEdit,
}: LiveReportViewProps) => {
  const durationSeconds = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000))
  const figures = bilanFigures(report, insights, durationSeconds)
  const [view, setView] = useState<'general' | 'moderation' | 'creator'>('general')

  return (
    <LiveEditProvider value={{ liveId, canEdit }}>
      <div className={LIVE_REPORT.wrapper}>
        {!available && <p className={LIVE_REPORT.notice}>{LIVE_REPORT_COPY.unavailable}</p>}

        <div className={LIVE_REPORT.tabs}>
          <SegmentedControl
            label={BILAN_COPY.tabsLabel}
            value={view}
            onChange={setView}
            options={[
              { value: 'general', label: BILAN_COPY.tabGeneral },
              { value: 'moderation', label: BILAN_COPY.tabModeration },
              ...(showCreator ? [{ value: 'creator' as const, label: BILAN_COPY.tabCreator }] : []),
            ]}
          />
        </div>

        {view === 'general' ? (
          <>
            <BilanFigures figures={figures} />
            <BilanActivity insights={insights} levels={report.levels} start={start} end={end} />
            <BilanVersus
              insights={insights}
              baseline={baseline}
              actions={report.actions}
              durationSeconds={durationSeconds}
            />
            <BilanBreakdown insights={insights} byKind={report.byKind} withDetail />
            {/* Only a change of level in the live is worth a section */}
            {report.levels.length > 1 && <BilanLevels levels={insights.levels} />}
            <BilanExports stem={stem} figures={figures} insights={insights} log={log} />
          </>
        ) : view === 'creator' && showCreator ? (
          <>
            <CreatorBilan
              report={report}
              insights={insights}
              baseline={baseline}
              start={start}
              end={end}
              stem={stem}
              creator={creator}
            />
          </>
        ) : (
          <BilanModeration
            team={team}
            notes={notes}
            report={report}
            log={log}
            start={start}
            end={end}
            bucketMinutes={insights.bucketMinutes}
          />
        )}
      </div>
    </LiveEditProvider>
  )
}
