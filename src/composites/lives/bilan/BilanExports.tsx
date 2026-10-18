'use client'

import { DownloadButton } from '@/components/elements/actions/DownloadButton'
import { PrintButton } from '@/components/elements/actions/PrintButton'
import { Section } from '@/components/structures/page/Section'
import type { BilanFigure } from '@/core/lib/lives/bilanFigures'
import { bilanJson, logCsv, summaryCsv, timelineCsv } from '@/core/lib/lives/bilanExport'
import type { LiveInsights } from '@/core/lib/lives/insights'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine } from '@/types/lives'

export interface BilanExportsProps {
  // File name stem
  stem: string
  figures: BilanFigure[]
  insights: LiveInsights
  // Left out of a creator's files
  log?: LiveLogLine[]
}

/**
 * Downloads of a Bilan
 * @param {string} stem - File name stem
 * @param {BilanFigure[]} figures - Key figures
 * @param {LiveInsights} insights - Insights
 * @param {LiveLogLine[]} [log] - Log lines
 * @return {JSX.Element}
 */

export const BilanExports = ({ stem, figures, insights, log }: BilanExportsProps) => {
  const name = `${BILAN_COPY.exportFile}-${stem}`

  return (
    <Section title={BILAN_COPY.exportTitle} description={BILAN_COPY.exportLead} padded>
      <div className={LIVE_REPORT.exports}>
        <DownloadButton
          label={BILAN_COPY.exportSummary}
          filename={`${name}-chiffres.csv`}
          mime="text/csv"
          build={() => summaryCsv(figures)}
        />
        <DownloadButton
          label={BILAN_COPY.exportTimeline}
          filename={`${name}-courbe.csv`}
          mime="text/csv"
          build={() => timelineCsv(insights)}
        />
        {log && (
          <DownloadButton
            label={BILAN_COPY.exportLog}
            filename={`${name}-logs.csv`}
            mime="text/csv"
            build={() => logCsv(log)}
          />
        )}
        <DownloadButton
          label={BILAN_COPY.exportData}
          filename={`${name}.json`}
          mime="application/json"
          build={() => bilanJson({ figures, insights, ...(log ? { log } : {}) })}
        />
        <PrintButton label={LIVE_REPORT_COPY.print} />
      </div>
    </Section>
  )
}
