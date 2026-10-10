'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { CourseCarousel } from '@/composites/academy/course/CourseCarousel'
import { CourseCeremony } from '@/composites/academy/course/CourseCeremony'
import { CourseStage } from '@/composites/academy/course/CourseStage'
import { CourseUnlockBubble } from '@/composites/academy/course/CourseUnlockBubble'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { beaconProps } from '@/declarations/ui/beacons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

export interface CourseCatalogProps {
  courses: CourseCard[]
  // Course just finished
  celebrate?: string | null
  // The specialisations just opened
  showUnlock?: boolean
}

/**
 * Catalogue of the interactive courses: the one to take next on the stage, every course in a
 * carousel to pick from
 * @param {CourseCatalogProps} props - Courses of the member
 * @return {JSX.Element}
 */

export const CourseCatalog = ({ courses, celebrate, showUnlock }: CourseCatalogProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(
    celebrate && courses.some((course) => course.id === celebrate) ? celebrate : null
  )

  // Indispensable courses lead, then the specialisations
  const ordered = useMemo(
    () => [
      ...courses.filter((course) => course.track === 'indispensable'),
      ...courses.filter((course) => course.track !== 'indispensable'),
    ],
    [courses]
  )
  const open = useMemo(() => ordered.filter((course) => !course.isLocked), [ordered])
  const next = open.find((course) => course.status !== TrainingStatuses.Done) ?? null
  const freshIds = useMemo(
    () =>
      new Set(
        courses
          .filter(
            (course) =>
              !course.isLocked &&
              course.track === 'secondary' &&
              course.status === TrainingStatuses.NotStarted
          )
          .map((course) => course.id)
      ),
    [courses]
  )

  // The most fitting course sits on the stage
  const selected = next ?? open[0]

  // Bring a chosen card into view in its row
  const reveal = useCallback((courseId: string) => {
    document
      .querySelector(`[data-course-tile="${courseId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [])

  useEffect(() => {
    if (pending) reveal(pending)
  }, [pending, reveal])

  // Once landed
  const land = useCallback(() => {
    setPending(null)
    router.replace(pathname)
  }, [pathname, router])

  // The first specialisation takes the stage
  const openFresh = useCallback(() => {
    const first = ordered.find((course) => freshIds.has(course.id))
    if (!first) return

    reveal(first.id)
  }, [freshIds, ordered, reveal])

  if (!selected) {
    return (
      <EmptyState
        figure="academy"
        title={COURSE_COPY.emptyTitle}
        description={COURSE_COPY.emptyDescription}
        action={<span />}
      />
    )
  }

  return (
    <div className={COURSE_CATALOG.page}>
      {pending && <CourseCeremony courseId={pending} onDone={land} />}
      {showUnlock && <CourseUnlockBubble onOpen={openFresh} />}
      <section className={COURSE_CATALOG.group} {...beaconProps(TOUR_BEACONS.coursesStage)}>
        <h2 className={COURSE_CATALOG.title}>{COURSE_COPY.stageTitle}</h2>
        <CourseStage course={selected} />
      </section>
      <div className={COURSE_CATALOG.page} {...beaconProps(TOUR_BEACONS.coursesList)}>
        {[
          {
            key: 'indispensable',
            title: COURSE_COPY.indispensableTitle,
            lead: COURSE_COPY.indispensableLead,
            list: ordered.filter((course) => course.track === 'indispensable'),
          },
          {
            key: 'secondary',
            title: COURSE_COPY.secondaryTitle,
            lead: COURSE_COPY.secondaryLead,
            list: ordered.filter((course) => course.track !== 'indispensable'),
          },
        ].map(
          ({ key, title, lead, list }) =>
            list.length > 0 && (
              <CourseCarousel
                key={key}
                title={title}
                lead={lead}
                courses={list}
                selectedId={selected.id}
                pendingId={pending}
                freshIds={freshIds}
                onSelect={(courseId) => router.push(ROUTES.training(courseId))}
              />
            )
        )}
      </div>
    </div>
  )
}
