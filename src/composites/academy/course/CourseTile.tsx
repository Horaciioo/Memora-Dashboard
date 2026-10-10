import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { CoursePhoto } from '@/composites/academy/course/CoursePhoto'
import { CourseTileInfo } from '@/composites/academy/course/CourseTileInfo'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { COURSE_CATALOG, COURSE_STAMP } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'
import { cn } from '@/utils/classnames'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

export interface CourseTileProps {
  course: CourseCard
  isSelected: boolean
  // Waiting for its ceremony
  isPending: boolean
  // Specialisation not started yet
  isFresh: boolean
  onSelect: () => void
}

/**
 * One course of the carousel, picked to put it on the stage
 * @param {CourseTileProps} props - Course and state
 * @return {JSX.Element}
 */

export const CourseTile = ({
  course,
  isSelected,
  isPending,
  isFresh,
  onSelect,
}: CourseTileProps) => {
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  // A card waiting for its ceremony keeps its colours until the stamp lands
  const isDone = course.status === TrainingStatuses.Done && !isPending
  const isInert = Boolean(course.isTour || course.isUnavailable)
  const state = course.isUnavailable
    ? COURSE_COPY.unavailable
    : isDone
      ? COURSE_COPY.done
      : course.isTour
        ? COURSE_COPY.tourState
        : course.passed > 0
          ? COURSE_COPY.resume
          : COURSE_COPY.start

  const content = (
    <>
      <span
        data-course-poster={course.id}
        className={cn(COURSE_CATALOG.tilePhoto, COURSE_STAMP.posterWrap)}
      >
        <CoursePhoto
          surface={course.surface}
          className={cn(COURSE_CATALOG.tileImage, isDone && COURSE_CATALOG.tileImageDone)}
          sizes="(min-width: 640px) 288px, 256px"
        />
        <span className={COURSE_CATALOG.tileShade} aria-hidden="true" />
        {isFresh && !isDone && <span className={COURSE_CATALOG.tileTag}>{COURSE_COPY.newTag}</span>}
        <span className={COURSE_CATALOG.tileTitle}>{course.name}</span>
        {course.maturity && (
          <MaturityTag
            maturity={course.maturity}
            interactive={false}
            compact
            className="absolute top-3 right-3"
          />
        )}
        {isDone && <span className={COURSE_STAMP.cardStamp}>{COURSE_COPY.stamp}</span>}
      </span>
      <span className={COURSE_CATALOG.tileBody}>
        <CourseTileInfo lines={[surface.label, COURSE_COPY.minutes(course.minutes)]} />
        <span className={cn(COURSE_CATALOG.tileState, isDone && COURSE_CATALOG.tileDone)}>
          {state}
        </span>
      </span>
    </>
  )
  const className = cn(
    COURSE_CATALOG.tile,
    isDone && COURSE_CATALOG.tileDoneCard,
    isInert && COURSE_CATALOG.tileInert,
    course.isUnavailable && COURSE_CATALOG.tileUnavailable,
    isSelected && COURSE_CATALOG.tileSelected
  )

  if (isInert) {
    return (
      <div aria-disabled="true" data-course-tile={course.id} className={className}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      data-course-tile={course.id}
      className={className}
    >
      {content}
    </button>
  )
}
