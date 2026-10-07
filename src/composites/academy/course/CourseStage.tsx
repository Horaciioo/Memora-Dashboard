import { MaturityTag } from '@/components/elements/display/MaturityTag'
import Link from 'next/link'

import { CoursePhoto } from '@/composites/academy/course/CoursePhoto'
import { CourseSteps } from '@/composites/academy/course/CourseSteps'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

export interface CourseStageProps {
  course: CourseCard
}

/**
 * The course in focus, large: its photograph, what it teaches and the way in
 * @param {CourseStageProps} props - Selected course
 * @return {JSX.Element}
 */

export const CourseStage = ({ course }: CourseStageProps) => {
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  const SurfaceIcon = ICONS[surface.icon]
  const Forward = ICONS.forward
  const isDone = course.status === TrainingStatuses.Done
  const action = isDone
    ? COURSE_COPY.review
    : course.passed > 0
      ? COURSE_COPY.resume
      : COURSE_COPY.start

  return (
    <section className={COURSE_CATALOG.stage} aria-label={course.name}>
      <div className={COURSE_CATALOG.stageBand}>
        <CoursePhoto
          key={course.surface}
          surface={course.surface}
          className={COURSE_CATALOG.stagePhoto}
          sizes="(min-width: 1280px) 1152px, 100vw"
          isPriority
        />
        <div className={COURSE_CATALOG.stageShade} aria-hidden="true" />
        <div className={COURSE_CATALOG.stageTop}>
          <span className={COURSE_CATALOG.stageSurface}>
            <SurfaceIcon className={COURSE_CATALOG.tileSurfaceIcon} aria-hidden="true" />
            {surface.label}
          </span>
        </div>
      </div>
      <div className={COURSE_CATALOG.stageBody}>
        <div className={COURSE_CATALOG.stageText}>
          <span className={COURSE_CATALOG.stageKicker}>
            {course.track === 'indispensable'
              ? COURSE_COPY.trackIndispensable
              : COURSE_COPY.trackSecondary}
          </span>
          <h2 className={COURSE_CATALOG.stageName}>
            {course.name}{' '}
            {course.maturity && <MaturityTag maturity={course.maturity} interactive={false} />}
          </h2>
          <p className={COURSE_CATALOG.stageSummary}>{course.summary}</p>
        </div>
        <div className={COURSE_CATALOG.stageSide}>
          <div className={COURSE_CATALOG.stageProgress}>
            <span className={COURSE_CATALOG.stageProgressLabel}>{COURSE_COPY.progressTitle}</span>
            <span className={COURSE_CATALOG.stageProgressValue}>
              {COURSE_COPY.passedOf(isDone ? course.exercises : course.passed, course.exercises)}
            </span>
            <CourseSteps total={course.exercises} passed={course.passed} isDone={isDone} />
          </div>
          <p className={COURSE_CATALOG.stageMeta}>
            <span>{COURSE_COPY.minutes(course.minutes)}</span>
            <span>{COURSE_COPY.chaptersCount(course.chapters)}</span>
          </p>
          <Link href={ROUTES.training(course.id)} className={`group ${COURSE_CATALOG.stageAction}`}>
            {action}
            <Forward className={COURSE_CATALOG.actionIcon} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
