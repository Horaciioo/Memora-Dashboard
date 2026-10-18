import { Status } from '@/components/elements/display/Status'
import type { QueueReport } from '@/core/services/system/QueueReportService'
import { CONSOLE_COPY } from '@/declarations/system/monitoring/console'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { formatDayTime } from '@/utils/format/dates'

export interface JobsSummaryProps {
  report: QueueReport
}

/**
 * One line per job: last run and failures
 * @param {QueueReport} report - Queue report
 * @return {JSX.Element}
 */

export const JobsSummary = ({ report }: JobsSummaryProps) => {
  if (!report.running) {
    return <p className={CONSOLE_BLOCK.rowMeta}>{CONSOLE_COPY.jobsStopped}</p>
  }

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {report.jobs.map((job) => {
        const failed = job.stats?.failed ?? 0
        const last = job.overview.runs[0]

        return (
          <div key={job.name} className={CONSOLE_BLOCK.row}>
            <span className={CONSOLE_BLOCK.rowLabel}>{job.label}</span>
            <span className={CONSOLE_BLOCK.rowStatus}>
              <span className={CONSOLE_BLOCK.rowMeta}>
                {last ? formatDayTime(new Date(last.startedAt)) : CONSOLE_COPY.jobNever}
              </span>
              <Status
                label={
                  failed > 0 ? `${CONSOLE_COPY.jobFailing} : ${failed}` : CONSOLE_COPY.jobHealthy
                }
                tone={failed > 0 ? 'danger' : 'success'}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}
