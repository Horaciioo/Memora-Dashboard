import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { StoragePanel } from '@/composites/system/StoragePanel'
import { SubjectBadges } from '@/composites/system/SubjectBadges'
import {
  readRuntimeReport,
  readStorageReport,
  subjectState,
} from '@/core/services/system/ConsoleService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatBytes } from '@/utils/format/numbers'

export const metadata: Metadata = { title: SYSTEM_COPY.storageTitle }

/**
 * What the file store holds, destination by destination
 * @return {Promise<JSX.Element>} - Storage page
 */

export default async function StoragePage() {
  await requirePermission(Permissions.AccessManage)

  const report = await readStorageReport()
  const runtime = readRuntimeReport()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.storageTitle} lead={SYSTEM_COPY.storageLead} />

      <Section title={SYSTEM_COPY.storageUsage} description={SYSTEM_COPY.storageUsageLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: SYSTEM_COPY.metricObjects, value: report.entries },
            { label: SYSTEM_COPY.metricWeight, value: formatBytes(report.bytes) },
            { label: SYSTEM_COPY.metricBuckets, value: report.buckets.length },
          ]}
        />
      </Section>

      <Section
        title={SYSTEM_COPY.storageBuckets}
        description={SYSTEM_COPY.storageBucketsLead}
        action={<SubjectBadges state={subjectState(runtime, 'storage')} />}
        padded
      >
        <StoragePanel report={report} />
      </Section>
    </div>
  )
}
