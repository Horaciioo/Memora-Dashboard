import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CoursePlayer } from '@/composites/academy/course/CoursePlayer'
import { readCourse } from '@/core/services/academy/CurriculumService'
import { readCourseContext } from '@/core/services/academy/CourseContextService'
import { requireUser } from '@/core/wrappers/requireUser'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ACADEMY_COPY, COURSE_COPY } from '@/declarations/academy/copy'
import { isEncadrement } from '@/declarations/access/roles'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { MemberStatuses } from '@/utils/constants/hierarchy'

interface CoursePageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: ACADEMY_COPY.myTrainingsTitle }

/**
 * One interactive course
 * @param {CoursePageProps} props - Training identifier
 * @return {Promise<JSX.Element>} - Course page
 */

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params
  const { session, scope } = await requireUser()

  if (session.status !== MemberStatuses.Academy && !isEncadrement(session.role)) {
    redirect(ROUTES.home)
  }

  // A course out of the member's catalogue
  const found = await readCourse(id, session).catch(() => null)
  if (!found) redirect(ROUTES.trainings)

  const { course, progress } = found
  const context = await readCourseContext(await scope())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <CoursePlayer
        submitPath={API_ROUTES.courseExercise(id)}
        course={course}
        initialProgress={progress}
        backHref={ROUTES.trainings}
        backLabel={COURSE_COPY.back}
        trainingId={id}
        context={context}
      />
    </div>
  )
}
