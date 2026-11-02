import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { HealthRefresh } from '@/composites/system/health/HealthRefresh'
import { RankedLoads } from '@/composites/system/health/RankedLoads'
import { readHealthReport } from '@/core/services/system/HealthService'
import { requireSystem } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { HEALTH_COPY } from '@/declarations/system/monitoring/health'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { formatSpan } from '@/utils/format/modview'
import { formatBytes, formatNumber, formatPercent } from '@/utils/format/numbers'

export const metadata: Metadata = { title: SYSTEM_COPY.healthTitle }

/**
 * How Memora is doing at this very moment
 * @return {Promise<JSX.Element>} - Health page
 */

export default async function HealthPage() {
  await requireSystem()

  const { memory, processor, database, now, heaviest, takenAt } = await readHealthReport()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.healthTitle} actions={<HealthRefresh takenAt={takenAt} />} />

      <Section title={HEALTH_COPY.memory} description={HEALTH_COPY.memoryLead} bare>
        <ConsoleMetrics
          metrics={[
            {
              label: HEALTH_COPY.memoryUsed,
              value: formatBytes(memory.rss),
              max: formatBytes(memory.hostTotal),
              hint: HEALTH_COPY.memoryUsedHint,
            },
            {
              label: HEALTH_COPY.heap,
              value: formatBytes(memory.heapUsed),
              max: formatBytes(memory.heapLimit),
              hint: formatPercent(memory.heapUsed / memory.heapLimit),
            },
            {
              label: HEALTH_COPY.offHeap,
              value: formatBytes(memory.offHeap),
              hint: HEALTH_COPY.offHeapHint,
            },
            {
              label: HEALTH_COPY.host,
              value: formatBytes(memory.hostTotal - memory.hostFree),
              max: formatBytes(memory.hostTotal),
              hint: `${formatBytes(memory.hostFree)} ${HEALTH_COPY.hostHint}`,
            },
          ]}
        />
      </Section>

      <Section title={HEALTH_COPY.processor} description={HEALTH_COPY.processorLead} bare>
        <ConsoleMetrics
          metrics={[
            {
              label: HEALTH_COPY.cpu,
              value: formatPercent(processor.cpu),
              hint: HEALTH_COPY.cpuHint,
            },
            {
              label: HEALTH_COPY.loop,
              value: formatPercent(processor.loop),
              hint: HEALTH_COPY.loopHint,
            },
            {
              label: HEALTH_COPY.load,
              value: formatPercent(processor.load),
              hint: HEALTH_COPY.loadHint,
            },
            {
              label: HEALTH_COPY.uptime,
              value: formatSpan(processor.uptimeSeconds),
              hint: HEALTH_COPY.uptimeHint,
            },
          ]}
        />
      </Section>

      <Section title={HEALTH_COPY.database} description={HEALTH_COPY.databaseLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: HEALTH_COPY.databaseSize, value: formatBytes(database.bytes) },
            {
              label: HEALTH_COPY.connections,
              value: formatNumber(database.connections),
              max: formatNumber(database.maxConnections),
            },
            {
              label: HEALTH_COPY.cacheHit,
              value:
                database.cacheHit === null ? HEALTH_COPY.none : formatPercent(database.cacheHit),
              hint: HEALTH_COPY.cacheHitHint,
            },
          ]}
        />
      </Section>

      <Section title={HEALTH_COPY.now} description={HEALTH_COPY.nowLead} bare>
        <ConsoleMetrics
          metrics={[
            { label: HEALTH_COPY.sessions, value: now.sessions },
            { label: HEALTH_COPY.readers, value: now.readers, hint: HEALTH_COPY.readersHint },
            { label: HEALTH_COPY.sockets, value: now.sockets, hint: HEALTH_COPY.socketsHint },
            { label: HEALTH_COPY.presence, value: now.presence, hint: HEALTH_COPY.presenceHint },
            { label: HEALTH_COPY.docs, value: now.docs, hint: HEALTH_COPY.docsHint },
            { label: HEALTH_COPY.files, value: now.files, hint: HEALTH_COPY.filesHint },
          ]}
        />
      </Section>

      <Section title={HEALTH_COPY.rankHeap} description={HEALTH_COPY.heaviestLead} padded>
        <RankedLoads loads={heaviest.heap} />
      </Section>

      <Section title={HEALTH_COPY.rankTables} padded>
        <RankedLoads loads={heaviest.tables} />
      </Section>

      <Section title={HEALTH_COPY.rankBuckets} padded>
        <RankedLoads loads={heaviest.buckets} />
      </Section>
    </div>
  )
}
