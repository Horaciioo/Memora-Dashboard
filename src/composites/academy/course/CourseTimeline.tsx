'use client'

import { Fragment } from 'react'

import { COURSE_COPY } from '@/declarations/academy/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_TIMELINE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CourseTimelineProps {
  chapters: { key: string; title: string }[]
  current: number
  // Share of the current chapter already read
  fill: number
  // Every chapter cleared
  finished: boolean
}

/**
 * Horizontal timeline: a circle per chapter, cleared ones green and the open one blue. The dashes
 * after the open chapter fill as it is read, and stop at the next circle until the reader moves on
 * @param {CourseTimelineProps} props - Chapters
 * @return {JSX.Element}
 */

export const CourseTimeline = ({ chapters, current, fill, finished }: CourseTimelineProps) => {
  const CheckIcon = ICONS.picked

  return (
    <nav className={COURSE_TIMELINE.bar} aria-label={COURSE_COPY.chapters}>
      <ol className={COURSE_TIMELINE.track}>
        {chapters.map((chapter, index) => {
          const done = finished || index < current
          const now = !finished && index === current

          return (
            <Fragment key={chapter.key}>
              <li
                title={chapter.title}
                aria-current={now ? 'step' : undefined}
                className={cn(
                  COURSE_TIMELINE.node,
                  done && COURSE_TIMELINE.nodeDone,
                  now && COURSE_TIMELINE.nodeNow,
                  !done && !now && COURSE_TIMELINE.nodeNext
                )}
              >
                {done ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </li>

              {index < chapters.length - 1 && (
                <li className={COURSE_TIMELINE.link} aria-hidden="true">
                  {(done || now) && (
                    <span
                      className={cn(
                        COURSE_TIMELINE.fill,
                        done ? COURSE_TIMELINE.fillDone : COURSE_TIMELINE.fillNow
                      )}
                      style={{ width: done ? '100%' : `${Math.round(fill * 100)}%` }}
                    />
                  )}
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
