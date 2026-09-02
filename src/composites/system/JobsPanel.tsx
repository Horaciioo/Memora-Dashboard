import { Badge } from '@/components/elements/display/Badge'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'

/**
 * One row per declared job, its cadence and the overrides it carries
 * @return {JSX.Element}
 */

export const JobsPanel = () => {
  const Icon = ICONS.queue

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {JOB_REGISTRY.keys.map((key) => {
        const job = JOB_REGISTRY.get(key)

        return (
          <div key={key} className={CONSOLE_BLOCK.row}>
            <span className={CONSOLE_BLOCK.rowLabel}>
              <Icon className={CONSOLE_BLOCK.rowIcon} aria-hidden="true" />
              {job.label}
            </span>

            <span className={CONSOLE_BLOCK.rowStatus}>
              {job.attempts !== undefined && (
                <span className={CONSOLE_BLOCK.rowMeta}>
                  {`${job.attempts} ${SYSTEM_COPY.queuesAttempts}`}
                </span>
              )}
              {job.concurrency !== undefined && (
                <span className={CONSOLE_BLOCK.rowMeta}>
                  {`${job.concurrency} ${SYSTEM_COPY.queuesConcurrency}`}
                </span>
              )}
              {job.schedule ? (
                <Badge label={job.schedule} tone="info" icon="clock" />
              ) : (
                <Badge label={SYSTEM_COPY.queuesOnDemand} tone="neutral" icon="pending" />
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
