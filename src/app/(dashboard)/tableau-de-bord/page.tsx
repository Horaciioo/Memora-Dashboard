import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { HomeAbsenceRequests } from '@/composites/personal/HomeAbsenceRequests'
import { AttendanceInbox } from '@/composites/personal/AttendanceInbox'
import { HomeBirthdays } from '@/composites/personal/HomeBirthdays'
import { HomeMeetings } from '@/composites/personal/HomeMeetings'
import { HomeTasks } from '@/composites/personal/HomeTasks'
import { REVIEW_FIELDS, listReviewQueue } from '@/core/services/absences/AbsenceService'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { myMeetings, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PERSONAL_COPY.title }

/**
 * Personal dashboard
 * @return {Promise<JSX.Element>} - Dashboard page
 */

export default async function DashboardPage() {
  const { session, access, scope } = await requireUser()
  const perimeter = await scope()

  const canReview = access.can(Permissions.AbsenceReview)

  const [tasks, rollCalls, meetings, birthdays, requests] = await Promise.all([
    myTasks(session, access),
    myRollCalls(session.id),
    myMeetings(session.id, perimeter),
    upcomingBirthdays(perimeter),
    canReview ? listReviewQueue(session.id, access.isAdmin) : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PERSONAL_COPY.greeting.replace('{name}', session.displayName)}
        lead={PERSONAL_COPY.lead}
      />
      <div className={HOME_STYLES.grid}>
        <div className={HOME_STYLES.column}>
          <HomeAbsenceRequests
            initial={requests.filter((absence) => absence.status === AbsenceStatuses.Pending)}
            reviewFields={REVIEW_FIELDS}
          />
          <HomeTasks items={tasks} />
          {rollCalls.length > 0 && <AttendanceInbox items={rollCalls} />}
        </div>
        <div className={HOME_STYLES.column}>
          <HomeMeetings items={meetings} canOpen={access.can(Permissions.MeetingRead)} />
          <HomeBirthdays items={birthdays} />
        </div>
      </div>
    </div>
  )
}
