import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { HomeAssistantWelcome } from '@/composites/personal/HomeAssistantWelcome'
import { HomeAway } from '@/composites/personal/HomeAway'
import { HomeBirthdays } from '@/composites/personal/HomeBirthdays'
import { HomePlanned } from '@/composites/personal/HomePlanned'
import { HomeFeatures } from '@/composites/personal/HomeFeatures'
import { HomeNews } from '@/composites/personal/HomeNews'
import { HomeQueue } from '@/composites/personal/HomeQueue'
import { HomePlay } from '@/composites/personal/play/HomePlay'
import { CourseUnlockBubble } from '@/composites/academy/course/catalog/CourseUnlockBubble'
import { HomeLiveCall } from '@/composites/lives/HomeLiveCall'
import { HomePushInvite } from '@/composites/personal/HomePushInvite'
import { HomePlayInvite } from '@/composites/play/invites/HomePlayInvite'
import { myCoordinationRequests } from '@/core/services/lives/CoordinationService'
import { readBeacon } from '@/core/services/lives/LiveService'
import { hasNewSpecialisations } from '@/core/services/academy/training/CurriculumService'
import { REVIEW_FIELDS, listReviewQueue } from '@/core/services/absences/AbsenceService'
import { myRollCalls } from '@/core/services/calendar/attendance'
import { awayToday, upcomingBirthdays } from '@/core/services/personal/HomeService'
import { upcomingPlans } from '@/core/services/personal/HomePlanService'
import { myTasks } from '@/core/services/personal/TaskInboxService'
import { requireUser } from '@/core/wrappers/requireUser'
import { isPushConfigured, VAPID_KEYS } from '@/declarations/pwa/vapid'
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
  const canPlay = access.can(Permissions.PlayAccess)

  const [tasks, rollCalls, planned, birthdays, away, requests, beacon, hasUnlock, coordination] =
    await Promise.all([
      myTasks(session, access),
      myRollCalls(session.id),
      upcomingPlans(session, access),
      upcomingBirthdays(perimeter),
      access.can(Permissions.AbsenceRead) ? awayToday(perimeter) : Promise.resolve([]),
      canReview ? listReviewQueue(session.id, access.isAdmin) : Promise.resolve([]),
      access.can(Permissions.LiveRead)
        ? readBeacon(perimeter, session.id, access.can(Permissions.LiveAnnounce))
        : Promise.resolve(null),
      hasNewSpecialisations(session.id),
      myCoordinationRequests(session.id),
    ])

  // Pending requests
  const pending = requests.filter((absence) => absence.status === AbsenceStatuses.Pending)

  return (
    <div className={HOME_FLOW.page}>
      <HomeAssistantWelcome />
      {hasUnlock && <CourseUnlockBubble />}
      {canPlay && <HomePlayInvite />}
      <PageHeader title={PERSONAL_COPY.title} heroDescription={PERSONAL_COPY.heroDescription} />
      {/* Empty once the note is read, so it leaves no gap */}
      <div className="empty:hidden" {...beaconProps(TOUR_BEACONS.homeNews)}>
        <HomeNews />
      </div>
      <div className="-mt-6 md:-mt-8" {...beaconProps(TOUR_BEACONS.homeFeatures)}>
        {canPlay ? <HomePlay /> : <HomeFeatures can={access.can} />}
      </div>
      <HomePushInvite publicKey={isPushConfigured() ? VAPID_KEYS.publicKey : null} />
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
          <div className="flex-1">
            <HomeBirthdays birthdays={birthdays} />
          </div>
          {access.can(Permissions.AbsenceRead) && (
            <div className={HOME_BOARD.split}>
              <HomeAway away={away} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
