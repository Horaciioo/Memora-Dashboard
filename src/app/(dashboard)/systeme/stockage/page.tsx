import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { LargestFiles } from '@/composites/system/LargestFiles'
import { StoragePanel } from '@/composites/system/StoragePanel'
import { SubjectBadges } from '@/composites/system/SubjectBadges'
import {
  readRuntimeReport,
  readStorageReport,
  subjectState,
} from '@/core/services/system/ConsoleService'
import { requireSystem } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { formatBytes } from '@/utils/format/numbers'

export const metadata: Metadata = { title: SYSTEM_COPY.storageTitle }

/**
 * What the file store holds
 * @return {Promise<JSX.Element>} - Storage page
 */

export default async function StoragePage() {
  await requireSystem()

  const report = await readStorageReport()
  const runtime = readRuntimeReport()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.storageTitle} />

      <Section title={SYSTEM_COPY.storageUsage} description={SYSTEM_COPY.storageUsageLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: SYSTEM_COPY.metricObjects, value: report.entries },
            { label: SYSTEM_COPY.metricWeight, value: formatBytes(report.bytes) },
            { label: SYSTEM_COPY.metricBuckets, value: report.buckets.length },
            {
              label: SYSTEM_COPY.storageOrphans,
              value:
                report.orphans.count === 0
                  ? SYSTEM_COPY.storageNone
                  : `${report.orphans.count}, ${formatBytes(report.orphans.bytes)}`,
              hint: SYSTEM_COPY.storageOrphansHint,
            },
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

      {report.largest.length > 0 && (
        <Section title={SYSTEM_COPY.storageLargest} padded>
          <LargestFiles files={report.largest} />
        </Section>
      )}
    </div>
  )
}
