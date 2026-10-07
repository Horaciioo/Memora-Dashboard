'use client'

import { CourseLockedTile } from '@/composites/academy/course/CourseLockedTile'
import { CourseTile } from '@/composites/academy/course/CourseTile'
import { useCarousel } from '@/core/hooks/interaction/useCarousel'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'

export interface CourseCarouselProps {
  title: string
  lead: string
  courses: CourseCard[]
  selectedId: string
  pendingId: string | null
  // Specialisations not started yet wear the new tag
  freshIds: Set<string>
  onSelect: (courseId: string) => void
}

/**
 * Row of course cards to pick from, paged by two arrows
 * @param {CourseCarouselProps} props - Courses and selection
 * @return {JSX.Element}
 */

export const CourseCarousel = ({
  title,
  lead,
  courses,
  selectedId,
  pendingId,
  freshIds,
  onSelect,
}: CourseCarouselProps) => {
  const { track, canPrevious, canNext, page } = useCarousel()
  const Previous = ICONS.back
  const Next = ICONS.forward

  return (
    <section className={COURSE_CATALOG.group}>
      <header className={COURSE_CATALOG.carouselHead}>
        <div className="flex flex-col gap-1">
          <h2 className={COURSE_CATALOG.title}>{title}</h2>
          <p className={COURSE_CATALOG.groupLead}>{lead}</p>
        </div>
        <div className={COURSE_CATALOG.carouselArrows}>
          <button
            type="button"
            aria-label={COURSE_COPY.carouselPrevious}
            disabled={!canPrevious}
            onClick={() => page(-1)}
            className={COURSE_CATALOG.arrow}
          >
            <Previous className={COURSE_CATALOG.arrowIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={COURSE_COPY.carouselNext}
            disabled={!canNext}
            onClick={() => page(1)}
            className={COURSE_CATALOG.arrow}
          >
            <Next className={COURSE_CATALOG.arrowIcon} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div ref={track} className={COURSE_CATALOG.track}>
        {courses.map((course) =>
          course.isLocked ? (
            <CourseLockedTile key={course.id} track={course.track} />
          ) : (
            <CourseTile
              key={course.id}
              course={course}
              isSelected={course.id === selectedId}
              isPending={course.id === pendingId}
              isFresh={freshIds.has(course.id)}
              onSelect={() => onSelect(course.id)}
            />
          )
        )}
      </div>
    </section>
  )
}
