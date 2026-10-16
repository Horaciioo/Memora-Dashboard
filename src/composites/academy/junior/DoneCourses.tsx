import { CoursePhoto } from '@/composites/academy/course/catalog/CoursePhoto'
import { ACADEMY_COPY, COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ICONS } from '@/declarations/ui/icons'
import { ACCOMPANIED_LIVES, DONE_COURSES, LIST_STYLES } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'

/**
 * Compact rows of the finished courses
 * @param {Object} props - Component props
 * @param {CourseCard[]} props.courses - Courses done
 * @return {JSX.Element}
 */

export const DoneCourses = ({ courses }: { courses: CourseCard[] }) => {
  const Check = ICONS.check

  return (
    <div className={DONE_COURSES.root}>
      <span className={ACCOMPANIED_LIVES.label}>{ACADEMY_COPY.doneCoursesTitle}</span>
      {courses.length === 0 ? (
        <p className={ACCOMPANIED_LIVES.empty}>{ACADEMY_COPY.doneCoursesEmpty}</p>
      ) : (
        <ul className={LIST_STYLES.stack}>
          {courses.map((course) => (
            <li key={course.id} className={LIST_STYLES.item}>
              <span className={DONE_COURSES.photo}>
                <CoursePhoto surface={course.surface} className={DONE_COURSES.image} sizes="40px" />
              </span>
              <span className={DONE_COURSES.body}>
                <span className={DONE_COURSES.name}>{course.name}</span>
                <span className={DONE_COURSES.meta}>
                  {[
                    COURSE_SURFACE_REGISTRY.get(course.surface).label,
                    COURSE_COPY.minutes(course.minutes),
                  ].join(' · ')}
                </span>
              </span>
              <Check className={DONE_COURSES.check} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
