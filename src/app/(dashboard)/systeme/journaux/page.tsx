import type { Metadata } from 'next'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { readRecentActivity } from '@/core/services/system/ActivityService'
import { readDataReport } from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.journalTitle }

/**
 * Latest recorded facts, newest first
 * @return {Promise<JSX.Element>} - Journal page
 */

export default async function JournalPage() {
  const { scope } = await requirePermission(Permissions.AccessManage)

  const [entries, data] = await Promise.all([readRecentActivity(), readDataReport(await scope())])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.journalTitle} lead={SYSTEM_COPY.journalLead} />

      <ConsoleMetrics
        metrics={[
          { label: SYSTEM_COPY.metricEntries, value: data.counts.logs },
          {
            label: SYSTEM_COPY.metricRetention,
            value: `${RETENTION_SETTINGS.activityLogDays} ${SYSTEM_COPY.retentionDays}`,
          },
        ]}
      />

      <Section title={SYSTEM_COPY.journalRecent} description={SYSTEM_COPY.journalRecentLead} padded>
        {entries.length === 0 ? (
          <EmptyState
            figure="notes"
            title={SYSTEM_COPY.journalEmptyTitle}
            description={SYSTEM_COPY.journalEmptyLead}
            action={<MaturityTag maturity="new" interactive={false} />}
            compact
          />
        ) : (
          <ActivityTimeline entries={entries} />
        )}
      </Section>
    </div>
  )
}
