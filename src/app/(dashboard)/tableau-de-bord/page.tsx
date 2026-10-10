import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { HomeBirthdays } from '@/composites/personal/HomeBirthdays'
import { HomeHeader } from '@/composites/personal/HomeHeader'
import { HomePlanned } from '@/composites/personal/HomePlanned'
import { HomeShortcuts } from '@/composites/personal/HomeShortcuts'
import { HomeNews } from '@/composites/personal/HomeNews'
import { HomeQueue } from '@/composites/personal/HomeQueue'
import { CourseUnlockBubble } from '@/composites/academy/course/CourseUnlockBubble'
import { HomeLiveCall } from '@/composites/lives/HomeLiveCall'
import { myCoordinationRequests } from '@/core/services/lives/CoordinationService'
import { readBeacon } from '@/core/services/lives/LiveService'
import { hasNewSpecialisations } from '@/core/services/academy/CurriculumService'
import { REVIEW_FIELDS, listReviewQueue } from '@/core/services/absences/AbsenceService'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { moderatorTrade, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { upcomingPlans } from '@/core/services/personal/HomePlanService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { requireUser } from '@/core/wrappers/requireUser'
import { changelogFor } from '@/declarations/changelog/helpers'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_BOARD, HOME_FLOW } from '@/declarations/ui/variants'
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

  const [tasks, rollCalls, planned, birthdays, requests, beacon, hasUnlock, coordination, trade] =
    await Promise.all([
      myTasks(session, access),
      myRollCalls(session.id),
      upcomingPlans(session, access),
      upcomingBirthdays(perimeter),
      canReview ? listReviewQueue(session.id, access.isAdmin) : Promise.resolve([]),
      access.can(Permissions.LiveRead)
        ? readBeacon(perimeter, session.id, access.can(Permissions.LiveAnnounce))
        : Promise.resolve(null),
      hasNewSpecialisations(session.id),
      myCoordinationRequests(session.id),
      moderatorTrade(session),
    ])

  // Pending requests
  const pending = requests.filter((absence) => absence.status === AbsenceStatuses.Pending)

  return (
    <div className={HOME_FLOW.page}>
      {hasUnlock && <CourseUnlockBubble />}
      <PageHeader title={PERSONAL_COPY.title} />
      <div {...beaconProps(TOUR_BEACONS.homeHeader)}>
        <HomeHeader name={session.displayName} />
      </div>
      <div {...beaconProps(TOUR_BEACONS.homeNews)}>
        <HomeNews release={changelogFor(access.can)[0]} />
      </div>
      <HomeLiveCall beacon={beacon} />
      <div className={HOME_BOARD.card}>
        <div className={HOME_BOARD.col} {...beaconProps(TOUR_BEACONS.homeQueue)}>
          <HomeQueue
            absences={pending}
            reviewFields={REVIEW_FIELDS}
            tasks={tasks}
            rollCalls={rollCalls}
            coordination={coordination}
          />
        </div>
        <div className={HOME_BOARD.col} {...beaconProps(TOUR_BEACONS.homePlanned)}>
          <HomePlanned entries={planned} />
        </div>
        <div className={HOME_BOARD.col} {...beaconProps(TOUR_BEACONS.homeBirthdays)}>
          <HomeBirthdays birthdays={birthdays} />
        </div>
      </div>
      <div {...beaconProps(TOUR_BEACONS.homeShortcuts)}>
        <HomeShortcuts can={access.can} trade={trade} />
      </div>
    </div>
  )
}
