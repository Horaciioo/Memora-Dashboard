import type { Metadata } from 'next'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { JobsPanel } from '@/composites/system/JobsPanel'
import { SubjectBadges } from '@/composites/system/SubjectBadges'
import { readRuntimeReport, subjectState } from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { JOB_REGISTRY } from '@/declarations/system/jobs'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.queuesTitle }

/**
 * Declared jobs and the state of the queue subject running them
 * @return {Promise<JSX.Element>} - Queues page
 */

export default async function QueuesPage() {
  await requirePermission(Permissions.AccessManage)

  const runtime = readRuntimeReport()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.queuesTitle} lead={SYSTEM_COPY.queuesLead} />

      <Section
        title={SYSTEM_COPY.queuesDeclared}
        description={SYSTEM_COPY.queuesDeclaredLead}
        action={<SubjectBadges state={subjectState(runtime, 'queues')} />}
        padded
      >
        {JOB_REGISTRY.keys.length === 0 ? (
          <EmptyState
            figure="settings"
            title={SYSTEM_COPY.queuesEmptyTitle}
            description={SYSTEM_COPY.queuesEmptyLead}
            action={<MaturityTag maturity="dev" interactive={false} />}
            compact
          />
        ) : (
          <JobsPanel />
        )}
      </Section>
    </div>
  )
}
