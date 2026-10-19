import { Status } from '@/components/elements/display/Status'
import { Dotted } from '@/components/elements/display/Dotted'
import { RetryJobButton } from '@/composites/system/queues/RetryJobButton'
import type { JobReport } from '@/core/services/system/QueueReportService'
import { QUEUES_COPY } from '@/declarations/system/queues'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import type { Tone } from '@/declarations/ui/theme'
import { formatDayTime } from '@/utils/format/dates'

export interface JobCardProps {
  job: JobReport
  canRetry: boolean
}

// Colour of each run outcome
const RUN_TONES: Record<'completed' | 'failed' | 'active', Tone> = {
  completed: 'success',
  failed: 'danger',
  active: 'info',
}

/**
 * One job with its counters and latest runs
 * @param {JobReport} job - Job report
 * @param {boolean} canRetry - Viewer may relaunch failures
 * @return {JSX.Element}
 */

export const JobCard = ({ job, canRetry }: JobCardProps) => {
  const { stats, overview } = job
  const last = overview.runs[0]

  return (
    <div className={CONSOLE_BLOCK.row}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className={CONSOLE_BLOCK.rowLabel}>{job.label}</span>
        <span className={CONSOLE_BLOCK.rowStatus}>
          <Status
            label={job.schedule ?? QUEUES_COPY.onDemand}
            tone={job.schedule ? 'info' : 'neutral'}
            icon={job.schedule ? 'clock' : 'pending'}
          />
          {stats?.isPaused && <Status label={QUEUES_COPY.paused} tone="warning" />}
          {stats && !stats.hasWorker && <Status label={QUEUES_COPY.noWorker} tone="danger" />}
          {overview.nextRun && (
            <span className={CONSOLE_BLOCK.rowMeta}>
              {`${QUEUES_COPY.nextRun} ${formatDayTime(new Date(overview.nextRun))}`}
            </span>
          )}
        </span>
        {stats && (
          <span className={CONSOLE_BLOCK.rowMeta}>
            <Dotted
              items={[
                `${QUEUES_COPY.waiting} ${stats.waiting}`,
                `${QUEUES_COPY.active} ${stats.active}`,
                `${QUEUES_COPY.delayed} ${stats.delayed}`,
                `${QUEUES_COPY.failed} ${stats.failed}`,
              ]}
            />
          </span>
        )}
        <span className={CONSOLE_BLOCK.rowMeta}>
          {last
            ? `${QUEUES_COPY.lastRun} ${formatDayTime(new Date(last.startedAt))}`
            : QUEUES_COPY.never}
        </span>
        <ol className="flex flex-col gap-1">
          {overview.runs.length === 0 && (
            <li className={CONSOLE_BLOCK.rowMeta}>{QUEUES_COPY.noRun}</li>
          )}
          {overview.runs.map((run) => (
            <li key={run.id} className="flex flex-wrap items-baseline gap-x-3 text-xs">
              <span className={CONSOLE_BLOCK.rowMeta}>
                {formatDayTime(new Date(run.startedAt))}
              </span>
              <Status label={QUEUES_COPY.states[run.state]} tone={RUN_TONES[run.state]} />
              {run.finishedAt && (
                <span
                  className={CONSOLE_BLOCK.rowMeta}
                >{`${run.finishedAt - run.startedAt} ms`}</span>
              )}
              {run.attempts > 1 && (
                <span className={CONSOLE_BLOCK.rowMeta}>
                  {`${run.attempts} ${QUEUES_COPY.attempts}`}
                </span>
              )}
              {run.reason && <span className="min-w-0 truncate">{run.reason}</span>}
            </li>
          ))}
        </ol>
      </div>
      {canRetry && stats && stats.failed > 0 && <RetryJobButton name={job.name} />}
    </div>
  )
}
