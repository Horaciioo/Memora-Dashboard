import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { ReleaseNotice } from '@/composites/changelog/ReleaseNotice'
import { AttendanceInbox } from '@/composites/personal/AttendanceInbox'
import { HomeBirthdays } from '@/composites/personal/HomeBirthdays'
import { HomeMeetings } from '@/composites/personal/HomeMeetings'
import { HomeTasks } from '@/composites/personal/HomeTasks'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { myMeetings, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PERSONAL_COPY.title }

/**
 * Personal dashboard
 * @return {Promise<JSX.Element>} - Dashboard page
 */

export default async function DashboardPage() {
  const { session, access, scope } = await requireUser()
  const perimeter = await scope()

  const [tasks, rollCalls, meetings, birthdays] = await Promise.all([
    myTasks(session, access),
    myRollCalls(session.id),
    myMeetings(session.id, perimeter),
    upcomingBirthdays(perimeter),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PERSONAL_COPY.greeting.replace('{name}', session.displayName)}
        lead={PERSONAL_COPY.lead}
      />
      <ReleaseNotice />
      <div className={HOME_STYLES.grid}>
        <div className={HOME_STYLES.column}>
          <HomeTasks items={tasks} />
          {rollCalls.length > 0 && <AttendanceInbox items={rollCalls} />}
          <HomeMeetings items={meetings} canOpen={access.can(Permissions.MeetingRead)} />
        </div>
        <div className={HOME_STYLES.column}>
          <HomeBirthdays items={birthdays} />
        </div>
      </div>
    </div>
  )
}
