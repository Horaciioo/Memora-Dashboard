'use client'

import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_COMPLETE } from '@/declarations/ui/variants'

export interface CourseCompleteProps {
  name: string
}

/**
 * Closing of a course: a check pops in front of its name and a line strikes it, the congratulation
 * rises, then a bubble points to the next course
 * @param {CourseCompleteProps} props - Course name
 * @return {JSX.Element}
 */

export const CourseComplete = ({ name }: CourseCompleteProps) => {
  const CheckIcon = ICONS.picked

  return (
    <section className={COURSE_COMPLETE.wrap} aria-live="polite">
      <div className={COURSE_COMPLETE.card}>
        <span className={`${COURSE_COMPLETE.mark} course-check`}>
          <CheckIcon className={COURSE_COMPLETE.markIcon} aria-hidden="true" />
        </span>
        <span className={COURSE_COMPLETE.name}>
          {name}
          <span className={COURSE_COMPLETE.strike} aria-hidden="true" />
        </span>
      </div>

      <h2 className={COURSE_COMPLETE.title}>{COURSE_COPY.bravo}</h2>

      <div className="flex flex-col items-center gap-5">
        <p className={COURSE_COMPLETE.bubble}>
          <span className={COURSE_COMPLETE.bubbleTail} aria-hidden="true" />
          {COURSE_COPY.anotherWaiting}
        </p>
        <Link href={ROUTES.trainings}>
          <Button variant="primary" icon="forward">
            {COURSE_COPY.completeCta}
          </Button>
        </Link>
      </div>
    </section>
  )
}
