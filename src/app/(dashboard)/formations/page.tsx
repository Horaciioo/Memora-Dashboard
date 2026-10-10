import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { CourseCatalog } from '@/composites/academy/course/CourseCatalog'
import { TrainingsWelcome } from '@/composites/academy/course/TrainingsWelcome'
import { hasSeenGuide } from '@/core/services/preferences/GuideService'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { GUIDE_KEYS } from '@/declarations/academy/welcome'
import { TrainingsPanel } from '@/composites/academy/TrainingsPanel'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { hasNewSpecialisations, listCourses } from '@/core/services/academy/CurriculumService'
import { requireUser } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY, COURSE_COPY } from '@/declarations/academy/copy'
import { isEncadrement } from '@/declarations/access/roles'
import { ROUTES, TRAININGS_DONE_PARAM } from '@/declarations/navigation'
import { COURSE_CATALOG, PAGE_STYLES } from '@/declarations/ui/variants'
import { MemberStatuses } from '@/utils/constants/hierarchy'

export const metadata: Metadata = { title: ACADEMY_COPY.myTrainingsTitle }

/**
 * A junior's own trainings
 * @return {Promise<JSX.Element>} - Trainings page
 */

export default async function TrainingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { session } = await requireUser()
  const query = await searchParams
  const celebrate = query[TRAININGS_DONE_PARAM]

  // Juniors train here
  if (session.status !== MemberStatuses.Academy && !isEncadrement(session.role)) {
    redirect(ROUTES.home)
  }

  const [junior, courses, seen, showSpecialisations] = await Promise.all([
    resolveOwnJunior(session.id),
    listCourses(session),
    hasSeenGuide(session.id, GUIDE_KEYS.trainingsWelcome),
    hasNewSpecialisations(session.id),
  ])

  // First visit opens the welcome
  const mandatory = courses.filter((course) => course.track === 'indispensable' && !course.isTour)
  const showWelcome = !seen
  const trade = COURSE_SURFACE_REGISTRY.get(mandatory[0]?.surface ?? 'twitch').label

  // A course already sits in the catalogue above
  const courseIds = new Set(courses.map((course) => course.id))
  const trainings = junior
    ? (await myTrainings(session.id, junior.session.functionId, junior.dispositifId)).filter(
        (training) => !courseIds.has(training.id)
      )
    : []

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.myTrainingsTitle} />
      {showWelcome && <TrainingsWelcome mandatory={mandatory.length} trade={trade} />}
      <CourseCatalog
        courses={courses}
        celebrate={typeof celebrate === 'string' ? celebrate : null}
        showUnlock={!showWelcome && showSpecialisations}
      />
      {trainings.length > 0 && (
        <section className={COURSE_CATALOG.group}>
          <h2 className={COURSE_CATALOG.title}>{COURSE_COPY.consoleTitle}</h2>
          <TrainingsPanel initialTrainings={trainings} />
        </section>
      )}
    </div>
  )
}
