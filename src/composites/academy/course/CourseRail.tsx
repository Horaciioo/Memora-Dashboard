'use client'

import Link from 'next/link'

import type { CourseRailState } from '@/core/hooks/interaction/useCourseRail'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_RAIL } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CourseRailProps {
  rail: CourseRailState
}

/**
 * Left sidebar of an open course: the way back, then the chapters upright. Earlier chapters can
 * be reopened, later ones stay shut so none is skipped
 * @param {CourseRailProps} props - Course open in the page
 * @return {JSX.Element}
 */

export const CourseRail = ({ rail }: CourseRailProps) => {
  const BackIcon = ICONS.back
  const CheckIcon = ICONS.picked

  return (
    <div className={COURSE_RAIL.wrap}>
      <Link href={rail.backHref} className={COURSE_RAIL.back}>
        <BackIcon className="h-4 w-4" aria-hidden="true" />
        {rail.backLabel}
      </Link>

      <div className={COURSE_RAIL.head}>
        <span className={COURSE_RAIL.surface}>{rail.surfaceLabel}</span>
        <p className={COURSE_RAIL.name}>{rail.courseName}</p>
      </div>

      <ol className={COURSE_RAIL.list} aria-label={COURSE_COPY.chapters}>
        {rail.chapters.map((chapter, index) => {
          const done = rail.finished || index < rail.current
          const now = !rail.finished && index === rail.current
          const reopenable = done && !now

          return (
            <li key={chapter.key} className="relative">
              {index < rail.chapters.length - 1 && (
                <span
                  className={cn(
                    COURSE_RAIL.line,
                    done ? COURSE_RAIL.lineDone : COURSE_RAIL.lineNext
                  )}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                disabled={!reopenable}
                aria-current={now ? 'step' : undefined}
                onClick={() => rail.onSelect(index)}
                className={cn(
                  COURSE_RAIL.item,
                  'w-full',
                  reopenable && COURSE_RAIL.itemOpen,
                  !done && !now && COURSE_RAIL.itemLocked
                )}
              >
                <span
                  className={cn(
                    COURSE_RAIL.node,
                    done && COURSE_RAIL.nodeDone,
                    now && COURSE_RAIL.nodeNow,
                    !done && !now && COURSE_RAIL.nodeNext
                  )}
                >
                  {done ? <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span className={cn(COURSE_RAIL.title, now && COURSE_RAIL.titleNow)}>
                  {chapter.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
