'use client'

import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { useViewportSize } from '@/core/hooks/interaction/useViewportSize'
import { placeBubble } from '@/core/lib/tour/placement'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TOUR_SPOTLIGHT } from '@/declarations/ui/variants'
import type { TourRect } from '@/types/tour'
import { cn } from '@/utils/classnames'

export interface TourBubbleProps {
  // Part the bubble speaks about, none sits at the bottom of the screen
  rect: TourRect | null
  title: string
  body: string
  // Position among the steps of the page
  progress?: { index: number; total: number }
  // Buttons under the words
  children: ReactNode
}

/**
 * Words of the tour, set beside the part they speak about
 * @param {TourBubbleProps} props - Part, words and buttons
 * @return {JSX.Element | null}
 */

export const TourBubble = ({ rect, title, body, progress, children }: TourBubbleProps) => {
  const viewport = useViewportSize()
  const Done = ICONS.confirm
  if (!viewport) return null

  const spot = placeBubble(
    rect ?? { top: 0, left: 0, width: viewport.width, height: viewport.height },
    viewport,
    { width: TOUR_SETTINGS.bubbleWidthPx, height: TOUR_SETTINGS.bubbleHeightPx },
    TOUR_SETTINGS.bubbleGapPx
  )
  const style = {
    ...spot,
    '--tour-bubble-w': `${TOUR_SETTINGS.bubbleWidthPx}px`,
  } as CSSProperties

  return (
    <div role="dialog" aria-label={title} className={TOUR_SPOTLIGHT.bubble} style={style}>
      {progress && (
        <div className={TOUR_SPOTLIGHT.progress} role="img" aria-label={TOUR_COPY.progress}>
          {Array.from({ length: progress.total }, (_, step) => (
            <Fragment key={step}>
              <span
                className={cn(
                  TOUR_SPOTLIGHT.step,
                  step < progress.index
                    ? TOUR_SPOTLIGHT.stepDone
                    : step === progress.index
                      ? TOUR_SPOTLIGHT.stepCurrent
                      : TOUR_SPOTLIGHT.stepTodo
                )}
              >
                {step < progress.index ? (
                  <Done className={TOUR_SPOTLIGHT.stepGlyph} aria-hidden="true" />
                ) : (
                  step + 1
                )}
              </span>
              {step < progress.total - 1 && (
                <span className={TOUR_SPOTLIGHT.stepLine} aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>
      )}
      <p className={TOUR_SPOTLIGHT.title}>{title}</p>
      <p className={TOUR_SPOTLIGHT.body}>{body}</p>
      <div className={TOUR_SPOTLIGHT.actions}>{children}</div>
    </div>
  )
}
