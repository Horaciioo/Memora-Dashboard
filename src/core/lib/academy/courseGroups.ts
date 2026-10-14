import { COURSE_COPY } from '@/declarations/academy/copy'
import type { CourseCard } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

/**
 * Courses of one track under their heading
 * @typedef {Object} CourseGroup
 * @property {'indispensable' | 'secondary'} key - Track gathered
 * @property {string} title - Heading
 * @property {string} lead - What the track is for
 * @property {CourseCard[]} list - Its courses
 */

export interface CourseGroup {
  key: 'indispensable' | 'secondary'
  title: string
  lead: string
  list: CourseCard[]
}

/**
 * Gather courses under their track, the indispensable ones first
 * @param {CourseCard[]} courses - Catalogue of a member
 * @return {CourseGroup[]} - Tracks that hold at least one course
 */

export const groupCourses = (courses: CourseCard[]): CourseGroup[] =>
  [
    {
      key: 'indispensable' as const,
      title: COURSE_COPY.indispensableTitle,
      lead: COURSE_COPY.indispensableLead,
      list: courses.filter((course) => course.track === 'indispensable'),
    },
    {
      key: 'secondary' as const,
      title: COURSE_COPY.secondaryTitle,
      lead: COURSE_COPY.secondaryLead,
      list: courses.filter((course) => course.track !== 'indispensable'),
    },
  ].filter((group) => group.list.length > 0)

// A course a member can really take
const isOpen = (course: CourseCard): boolean =>
  !course.isLocked && !course.isUnavailable && !course.isTour

/**
 * Course a member is on right now: the one started, else the next to take
 * @param {CourseCard[]} courses - Catalogue of a member
 * @return {CourseCard | null} - Course in course
 */

export const currentCourse = (courses: CourseCard[]): CourseCard | null =>
  courses.find((course) => isOpen(course) && course.status === TrainingStatuses.InProgress) ??
  courses.find((course) => isOpen(course) && course.status !== TrainingStatuses.Done) ??
  null
