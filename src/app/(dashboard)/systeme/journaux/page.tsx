import type { Metadata } from 'next'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import AppLink from '@/components/elements/navigation/AppLink'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { JournalFilters } from '@/composites/system/journal/JournalFilters'
import { JournalPager } from '@/composites/system/journal/JournalPager'
import { JournalRow } from '@/composites/system/journal/JournalRow'
import { parseActivityFilters } from '@/core/lib/system/activityFilters'
import { readActivityPage, readActivityStats } from '@/core/services/system/ActivityQueryService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import { JOURNAL_COPY } from '@/declarations/system/journal'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { JOURNAL_TABLE_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.journalTitle }

interface JournalPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

/**
 * Searchable journal of recorded facts
 * @param {JournalPageProps} props - Address filters
 * @return {Promise<JSX.Element>} - Journal page
 */

export default async function JournalPage({ searchParams }: JournalPageProps) {
  await requirePermission(Permissions.AccessManage)

  const filters = parseActivityFilters(
    new URLSearchParams(
      Object.entries(await searchParams).flatMap(([key, value]) => (value ? [[key, value]] : []))
    )
  )

  const [result, stats] = await Promise.all([readActivityPage(filters), readActivityStats()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.journalTitle} />

      <ConsoleMetrics
        metrics={[
          { label: JOURNAL_COPY.statLast24h, value: stats.last24h },
          { label: JOURNAL_COPY.statWarnings, value: stats.warnings },
          { label: JOURNAL_COPY.statErrors, value: stats.errors },
          {
            label: JOURNAL_COPY.statLastError,
            value: stats.lastError ? formatDayTime(stats.lastError) : JOURNAL_COPY.statNoError,
            hint: `${SYSTEM_COPY.metricRetention} ${RETENTION_SETTINGS.activityLogDays} ${SYSTEM_COPY.retentionDays}`,
          },
        ]}
      />

      <JournalFilters actors={stats.actors} />

      <Section bare>
        {result.entries.length === 0 ? (
          <EmptyState
            figure="notes"
            title={JOURNAL_COPY.noResultTitle}
            description={JOURNAL_COPY.noResultLead}
            action={
              <AppLink href={ROUTES.journal}>
                <Button>{JOURNAL_COPY.reset}</Button>
              </AppLink>
            }
            compact
          />
        ) : (
          <>
            <div className={JOURNAL_TABLE_STYLES.head}>
              {JOURNAL_COPY.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            <ol className={JOURNAL_TABLE_STYLES.list}>
              {result.entries.map((entry) => (
                <JournalRow key={entry.id} entry={entry} />
              ))}
            </ol>
            <JournalPager page={result.page} pages={result.pages} />
          </>
        )}
      </Section>
    </div>
  )
}
