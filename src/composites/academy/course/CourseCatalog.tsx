'use client'

import Link from 'next/link'

import { ProgressRing } from '@/components/elements/feedback/ProgressRing'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { useTilt } from '@/core/hooks/interaction/useTilt'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_SURFACE_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CATALOG } from '@/declarations/ui/variants'
import type { CourseCard } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'

// Bar widths of the cover, a stand-in for chat lines going by
const COVER_BARS = ['62%', '38%', '80%', '48%', '70%', '30%', '56%', '84%']

export interface CourseCatalogProps {
  courses: CourseCard[]
}

/**
 * Cover of a course: lines drifting upward behind a glyph that floats above them, like a chat
 * going by
 * @param {Object} props - Course key, accent and glyph
 * @return {JSX.Element}
 */

const Cover = ({
  seed,
  accent,
  icon,
}: {
  seed: string
  accent: string
  icon: keyof typeof ICONS
}) => {
  const Icon = ICONS[icon]
  const offset = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return (
    <div
      className={COURSE_CATALOG.cover}
      style={{
        background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 55%, black))`,
      }}
    >
      <div className={COURSE_CATALOG.coverLines} aria-hidden="true">
        {[0, 1, 2].map((column) => (
          <div
            key={column}
            className={cn(COURSE_CATALOG.coverColumn, 'cover-column')}
            style={{ ['--cover-speed' as string]: `${8 + ((offset + column * 3) % 5) * 2}s` }}
          >
            {[...COVER_BARS, ...COVER_BARS].map((width, index) => (
              <span
                key={index}
                className={COURSE_CATALOG.coverBar}
                style={{
                  width: COVER_BARS[(index + offset + column * 2) % COVER_BARS.length] ?? width,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <Icon className={COURSE_CATALOG.coverIcon} aria-hidden="true" />
    </div>
  )
}

/**
 * One course as a card leaning toward the pointer, opening its reader
 * @param {Object} props - Course
 * @return {JSX.Element}
 */

const CourseTile = ({ course }: { course: CourseCard }) => {
  const tilt = useTilt()
  const surface = COURSE_SURFACE_REGISTRY.get(course.surface)
  const SurfaceIcon = ICONS[surface.icon]
  const LockIcon = ICONS.lock
  const isDone = course.status === TrainingStatuses.Done
  const action = isDone
    ? COURSE_COPY.review
    : course.passed > 0
      ? COURSE_COPY.resume
      : COURSE_COPY.start

  const body = (
    <>
      <Cover seed={course.key} accent={surface.accent} icon={surface.icon} />
      <div className={COURSE_CATALOG.body}>
        <span className={COURSE_CATALOG.surface}>
          <SurfaceIcon className="h-4 w-4" aria-hidden="true" />
          {surface.label}
        </span>
        <h3 className={COURSE_CATALOG.name}>{course.name}</h3>
        <p className={COURSE_CATALOG.summary}>{course.summary}</p>
        <div className={COURSE_CATALOG.foot}>
          <span className={COURSE_CATALOG.meta}>
            <span>{COURSE_COPY.minutes(course.minutes)}</span>
            <span>{COURSE_COPY.exercises(course.exercises)}</span>
          </span>
          {course.locked ? (
            <span className={COURSE_CATALOG.lock}>
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {COURSE_COPY.locked}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ProgressRing
                value={course.passed}
                max={course.exercises}
                colour={surface.accent}
                className="h-7 w-7"
              />
              <span className={COURSE_CATALOG.action}>{isDone ? COURSE_COPY.done : action}</span>
            </span>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div ref={tilt} className={COURSE_CATALOG.tilt}>
      {course.locked ? (
        <div className={cn(COURSE_CATALOG.card, COURSE_CATALOG.cardLocked)} aria-disabled="true">
          {body}
        </div>
      ) : (
        <Link href={ROUTES.training(course.id)} className={COURSE_CATALOG.card}>
          {body}
        </Link>
      )}
    </div>
  )
}

/**
 * Catalogue of the interactive courses, the indispensable ones first, then those opening with
 * the practice period
 * @param {CourseCatalogProps} props - Courses of the member
 * @return {JSX.Element}
 */

export const CourseCatalog = ({ courses }: CourseCatalogProps) => {
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
      {groups.map((group) => (
        <section key={group.key} className={COURSE_CATALOG.group}>
          <header className={COURSE_CATALOG.head}>
            <h2 className={COURSE_CATALOG.title}>{group.title}</h2>
            <p className={COURSE_CATALOG.lead}>{group.lead}</p>
          </header>
          <div className={COURSE_CATALOG.grid}>
            {group.courses.map((course) => (
              <CourseTile key={course.id} course={course} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
