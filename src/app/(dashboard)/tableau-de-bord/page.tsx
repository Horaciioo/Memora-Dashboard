import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { HomeAgenda } from '@/composites/personal/HomeAgenda'
import { HomeLives } from '@/composites/personal/HomeLives'
import { HomeQueue } from '@/composites/personal/HomeQueue'
import { HomeLiveCall } from '@/composites/lives/HomeLiveCall'
import { readBeacon } from '@/core/services/lives/LiveService'
import { REVIEW_FIELDS, listReviewQueue } from '@/core/services/absences/AbsenceService'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { readCurrentState } from '@/core/services/livecon/LiveconService'
import { myMeetings, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_FLOW } from '@/declarations/ui/variants'
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

  const [tasks, rollCalls, meetings, birthdays, requests, livecon, beacon] = await Promise.all([
    myTasks(session, access),
    myRollCalls(session.id),
    myMeetings(session.id, perimeter),
    upcomingBirthdays(perimeter),
    canReview ? listReviewQueue(session.id, access.isAdmin) : Promise.resolve([]),
    access.can(Permissions.LiveconRead) ? readCurrentState(perimeter) : Promise.resolve([]),
    access.can(Permissions.LiveRead)
      ? readBeacon(perimeter, session.id, access.can(Permissions.LiveAnnounce))
      : Promise.resolve(null),
  ])

  // Pending requests are the only ones that wait on the member
  const pending = requests.filter((absence) => absence.status === AbsenceStatuses.Pending)

  return (
    <div className={HOME_FLOW.page}>
      <PageHeader title={PERSONAL_COPY.greeting.replace('{name}', session.displayName)} />
      <HomeLiveCall beacon={beacon} />
      <HomeLives items={livecon} />
      <div className={HOME_FLOW.grid}>
        <HomeQueue
          absences={pending}
          reviewFields={REVIEW_FIELDS}
          tasks={tasks}
          rollCalls={rollCalls}
        />
        <section className={HOME_FLOW.column}>
          <h2 className={HOME_FLOW.label}>{PERSONAL_COPY.aheadTitle}</h2>
          <HomeAgenda
            meetings={meetings}
            birthdays={birthdays}
            canOpenMeeting={access.can(Permissions.MeetingRead)}
          />
        </section>
      </div>
    </div>
  )
}
