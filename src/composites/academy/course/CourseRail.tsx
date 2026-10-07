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

  // Share of the course read
  const total = rail.chapters.length
  const reading = rail.steps.length > 0 ? rail.step / rail.steps.length : 0
  const share = rail.finished ? 1 : (rail.current + reading) / total

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
        <span className={COURSE_RAIL.track} aria-hidden="true">
          <span
            className={COURSE_RAIL.trackFill}
            style={{ height: `${Math.round(share * 100)}%` }}
          />
        </span>
        {rail.chapters.map((chapter, index) => {
          const done = rail.finished || index < rail.current
          const now = !rail.finished && index === rail.current
          const reopenable = done && !now

          return (
            <li key={chapter.key} className="relative">
              <button
                type="button"
                disabled={!reopenable}
                aria-current={now ? 'step' : undefined}
                onClick={() => rail.onSelect(index)}
                className={cn(
                  COURSE_RAIL.item,
                  'w-full',
                  reopenable && COURSE_RAIL.itemOpen,
                  now && COURSE_RAIL.itemNow,
                  !done && !now && COURSE_RAIL.itemLocked
                )}
              >
                <span
                  className={cn(
                    COURSE_RAIL.index,
                    done && COURSE_RAIL.indexDone,
                    now && COURSE_RAIL.indexNow,
                    !done && !now && COURSE_RAIL.indexNext
                  )}
                >
                  {done ? <CheckIcon className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className={cn(COURSE_RAIL.title, now && COURSE_RAIL.titleNow)}>
                  {chapter.title}
                </span>
              </button>

              {now && (
                <ol className={COURSE_RAIL.steps} aria-label={COURSE_COPY.stepsLabel}>
                  {rail.steps.map((step, stepIndex) => {
                    const stepDone = stepIndex < rail.step
                    const stepNow = stepIndex === rail.step

                    return (
                      <li key={step.key}>
                        <button
                          type="button"
                          disabled={!stepDone}
                          aria-current={stepNow ? 'step' : undefined}
                          onClick={() => rail.onStep(stepIndex)}
                          className={cn(
                            COURSE_RAIL.stepItem,
                            'w-full',
                            stepDone && COURSE_RAIL.stepOpen,
                            stepNow && COURSE_RAIL.stepNow,
                            !stepDone && !stepNow && COURSE_RAIL.stepLocked
                          )}
                        >
                          <span
                            className={cn(
                              COURSE_RAIL.stepNumber,
                              stepDone && COURSE_RAIL.stepNumberDone,
                              stepNow && COURSE_RAIL.stepNumberNow
                            )}
                          >
                            {stepNow && <span className={COURSE_RAIL.ping} aria-hidden="true" />}
                            {index + 1}.{stepIndex + 1}
                          </span>
                          <span>{step.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
