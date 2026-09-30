import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CoursePlayer } from '@/composites/academy/course/CoursePlayer'
import { readCourse } from '@/core/services/academy/CurriculumService'
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
 * One interactive course, read and played to the end
 * @param {CoursePageProps} props - Training identifier
 * @return {Promise<JSX.Element>} - Course page
 */

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params
  const { session } = await requireUser()

  if (session.status !== MemberStatuses.Academy && !isEncadrement(session.role)) {
    redirect(ROUTES.home)
  }

  // A course out of the member's catalogue, or a training edited by hand, sends back to the list
  const found = await readCourse(id, session).catch(() => null)
  if (!found) redirect(ROUTES.trainings)

  const { course, progress } = found

  return (
    <div className={PAGE_STYLES.wrapper}>
      <CoursePlayer
        submitPath={API_ROUTES.courseExercise(id)}
        course={course}
        initialProgress={progress}
        backHref={ROUTES.trainings}
        backLabel={COURSE_COPY.back}
      />
    </div>
  )
}
