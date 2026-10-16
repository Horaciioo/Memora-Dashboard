import type { Metadata } from 'next'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { JobCard } from '@/composites/system/queues/JobCard'
import { SubjectBadges } from '@/composites/system/SubjectBadges'
import { readQueueReport } from '@/core/services/system/QueueReportService'
import { readRuntimeReport, subjectState } from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { QUEUES_COPY } from '@/declarations/system/queues'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.queuesTitle }

/**
 * Background jobs, their runs and failures
 * @return {Promise<JSX.Element>} - Queues page
 */

export default async function QueuesPage() {
  const { access } = await requirePermission(Permissions.AccessManage)

  const [report, runtime] = await Promise.all([
    readQueueReport(),
    Promise.resolve(readRuntimeReport()),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.queuesTitle} />

      <Section
        title={SYSTEM_COPY.queuesDeclared}
        action={<SubjectBadges state={subjectState(runtime, 'queues')} />}
        padded
      >
        {report.running ? (
          <div className={CONSOLE_BLOCK.rows}>
            {report.jobs.map((job) => (
              <JobCard key={job.name} job={job} canRetry={access.isAdmin} />
            ))}
          </div>
        ) : (
          <EmptyState
            figure="settings"
            title={QUEUES_COPY.stoppedTitle}
            description={QUEUES_COPY.stoppedLead}
            action={<SubjectBadges state={subjectState(runtime, 'queues')} />}
            compact
          />
        )}
      </Section>
    </div>
  )
}
