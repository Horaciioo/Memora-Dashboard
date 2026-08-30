import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { WipNotice } from '@/components/structures/WipNotice'
import { AttendanceInbox } from '@/composites/personal/AttendanceInbox'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PERSONAL_COPY.title }

/**
 * Personal dashboard
 * @return {Promise<JSX.Element>} - Dashboard page
 */

export default async function DashboardPage() {
  const { session } = await requireUser()
  const rollCalls = await myRollCalls(session.id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PERSONAL_COPY.greeting.replace('{name}', session.displayName)}
        lead={PERSONAL_COPY.lead}
      />
      {rollCalls.length > 0 && <AttendanceInbox items={rollCalls} />}
      <WipNotice figure="settings" description={PERSONAL_COPY.wip} />
    </div>
  )
}
