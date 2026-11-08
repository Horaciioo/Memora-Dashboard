import type { Metadata } from 'next'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { DailyBars } from '@/composites/system/audience/DailyBars'
import { ShareList } from '@/composites/system/audience/ShareList'
import { ConsoleMetrics } from '@/composites/system/ConsoleMetrics'
import { readAudience } from '@/core/services/system/AudienceService'
import { requireSystem } from '@/core/wrappers/requireUser'
import { AUDIENCE_COPY } from '@/declarations/system/monitoring/activity'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { DAILY_BARS_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: SYSTEM_COPY.analyticsTitle }

/**
 * Who uses Memora, from its own journal and sessions
 * @return {Promise<JSX.Element>} - Activity page
 */

export default async function ActivityPage() {
  await requireSystem()

  const audience = await readAudience()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.analyticsTitle} />

      <ConsoleMetrics
        metrics={[
          { label: AUDIENCE_COPY.activeDay, value: audience.activeDay },
          { label: AUDIENCE_COPY.activeWeek, value: audience.activeWeek },
          { label: AUDIENCE_COPY.activeMonth, value: audience.activeMonth },
          { label: AUDIENCE_COPY.logins, value: audience.logins },
          { label: AUDIENCE_COPY.sessions, value: audience.sessions },
          { label: AUDIENCE_COPY.handhelds, value: audience.handhelds },
        ]}
      />

      <Section title={AUDIENCE_COPY.daily} description={AUDIENCE_COPY.dailyLead} padded>
        {audience.activeMonth === 0 ? (
          <EmptyState
            figure="notes"
            title={AUDIENCE_COPY.emptyTitle}
            description={AUDIENCE_COPY.emptyLead}
            action={null}
            compact
          />
        ) : (
          <DailyBars days={audience.days} />
        )}
      </Section>

      <div className={DAILY_BARS_STYLES.split}>
        <Section title={AUDIENCE_COPY.browsers} padded>
          <ShareList shares={audience.browsers} />
        </Section>
        <Section title={AUDIENCE_COPY.systems} padded>
          <ShareList shares={audience.systems} />
        </Section>
      </div>

      <Section title={AUDIENCE_COPY.top} description={AUDIENCE_COPY.topLead} padded>
        <ShareList shares={audience.top} unit={AUDIENCE_COPY.actions} />
      </Section>
    </div>
  )
}
