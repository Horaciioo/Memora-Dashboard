import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { CourseCatalog } from '@/composites/academy/course/CourseCatalog'
import { TrainingsPanel } from '@/composites/academy/TrainingsPanel'
import { myTrainings, resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { listCourses } from '@/core/services/academy/CurriculumService'
import { requireUser } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY, COURSE_COPY } from '@/declarations/academy/copy'
import { isEncadrement } from '@/declarations/access/roles'
import { ROUTES } from '@/declarations/navigation'
import { COURSE_CATALOG, PAGE_STYLES } from '@/declarations/ui/variants'
import { MemberStatuses } from '@/utils/constants/hierarchy'

export const metadata: Metadata = { title: ACADEMY_COPY.myTrainingsTitle }

/**
 * A junior's own trainings: the interactive courses of their trade first, then any training the
 * console edits by hand
 * @return {Promise<JSX.Element>} - Trainings page
 */

export default async function TrainingsPage() {
  const { session } = await requireUser()

  // Juniors train here, the encadrement previews
  if (session.status !== MemberStatuses.Academy && !isEncadrement(session.role)) {
    redirect(ROUTES.home)
  }

  const [junior, courses] = await Promise.all([resolveOwnJunior(session.id), listCourses(session)])

  // A course already sits in the catalogue above, only the hand made ones stay below
  const courseIds = new Set(courses.map((course) => course.id))
  const trainings = junior
    ? (await myTrainings(session.id, junior.session.functionId, junior.dispositifId)).filter(
        (training) => !courseIds.has(training.id)
      )
    : []

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.myTrainingsTitle} />
      <CourseCatalog courses={courses} />
      {trainings.length > 0 && (
        <section className={COURSE_CATALOG.group}>
          <h2 className={COURSE_CATALOG.title}>{COURSE_COPY.consoleTitle}</h2>
          <TrainingsPanel initialTrainings={trainings} />
        </section>
      )}
    </div>
  )
}
