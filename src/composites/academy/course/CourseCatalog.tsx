'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { useCallback, useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { CourseCeremony } from '@/composites/academy/course/CourseCeremony'
import { CoursePoster } from '@/composites/academy/course/CoursePoster'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG, COURSE_STAMP } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'
import { cn } from '@/utils/classnames'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

export interface CourseCatalogProps {
  courses: CourseCard[]
  // Course just finished, its stamp played once
  celebrate?: string | null
}

/**
 * One course as a poster card: its scene, the place and name, a segment per exercise filled as
 * they are cleared, and the way in
 * @param {Object} props - Course
 * @return {JSX.Element}
 */

const CourseTile = ({ course, isPending }: { course: CourseCard; isPending: boolean }) => {
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  const SurfaceIcon = ICONS[surface.icon]
  const Forward = ICONS.forward
  const Done = ICONS.success
  // A card waiting for its ceremony keeps its colours until the stamp lands
  const isDone = course.status === TrainingStatuses.Done && !isPending
  const action = isDone
    ? COURSE_COPY.done
    : course.passed > 0
      ? COURSE_COPY.resume
      : COURSE_COPY.start

  return (
    <Link href={ROUTES.training(course.id)} className={COURSE_CATALOG.card}>
      <span data-course-poster={course.id} className={COURSE_STAMP.posterWrap}>
        <span className={cn(isDone && COURSE_STAMP.posterDone)}>
          <CoursePoster surface={course.surface} />
        </span>
        {isDone && <span className={COURSE_STAMP.cardStamp}>{COURSE_COPY.stamp}</span>}
      </span>
      <div className={COURSE_CATALOG.body}>
        <span className={COURSE_CATALOG.surface}>
          <SurfaceIcon className={COURSE_CATALOG.surfaceIcon} aria-hidden="true" />
          {surface.label}
        </span>
        <h3 className={COURSE_CATALOG.name}>{course.name}</h3>
        <p className={COURSE_CATALOG.summary}>{course.summary}</p>
        <div className={COURSE_CATALOG.foot}>
          <div className={COURSE_CATALOG.steps} aria-hidden="true">
            {Array.from({ length: course.exercises }, (_, step) => (
              <span
                key={step}
                className={cn(
                  COURSE_CATALOG.step,
                  (isDone || step < course.passed) && COURSE_CATALOG.stepDone,
                  isPending && COURSE_STAMP.stepFill
                )}
                style={isPending ? ({ '--step-index': step } as CSSProperties) : undefined}
              />
            ))}
          </div>
          <div className={COURSE_CATALOG.footRow}>
            <span className={COURSE_CATALOG.meta}>{COURSE_COPY.minutes(course.minutes)}</span>
            <span className={cn(COURSE_CATALOG.action, isDone && COURSE_CATALOG.done)}>
              {action}
              {isDone ? (
                <Done className={COURSE_CATALOG.actionIcon} aria-hidden="true" />
              ) : (
                <Forward className={COURSE_CATALOG.actionIcon} aria-hidden="true" />
              )}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * Catalogue of the interactive courses: the indispensable ones first, then those opening with
 * the practice period
 * @param {CourseCatalogProps} props - Courses of the member
 * @return {JSX.Element}
 */

export const CourseCatalog = ({ courses, celebrate }: CourseCatalogProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(
    celebrate && courses.some((course) => course.id === celebrate) ? celebrate : null
  )

  // Once landed, the flag leaves the address
  const land = useCallback(() => {
    setPending(null)
    router.replace(pathname)
  }, [pathname, router])

  if (courses.length === 0) {
    return (
      <EmptyState
        figure="academy"
        title={COURSE_COPY.emptyTitle}
        description={COURSE_COPY.emptyDescription}
        action={<span />}
      />
    )
  }

  const groups = [
    {
      key: 'indispensable',
      title: COURSE_COPY.indispensableTitle,
      lead: COURSE_COPY.indispensableLead,
      courses: courses.filter((course) => course.track === 'indispensable'),
    },
    {
      key: 'secondary',
      title: COURSE_COPY.secondaryTitle,
      lead: COURSE_COPY.secondaryLead,
      courses: courses.filter((course) => course.track === 'secondary'),
    },
  ].filter((group) => group.courses.length > 0)

  return (
    <div className={COURSE_CATALOG.page}>
      {pending && <CourseCeremony courseId={pending} onDone={land} />}
      {groups.map((group) => (
        <section key={group.key} className={COURSE_CATALOG.group}>
          <header className={COURSE_CATALOG.head}>
            <h2 className={COURSE_CATALOG.title}>{group.title}</h2>
            <p className={COURSE_CATALOG.lead}>{group.lead}</p>
          </header>
          <div className={COURSE_CATALOG.grid}>
            {group.courses.map((course) => (
              <CourseTile key={course.id} course={course} isPending={course.id === pending} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
