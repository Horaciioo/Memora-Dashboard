'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { TourBubble } from '@/composites/tour/TourBubble'
import { TourSpotlight } from '@/composites/tour/TourSpotlight'
import { useBeaconRect } from '@/core/hooks/interaction/useBeaconRect'
import { TOUR_COPY } from '@/declarations/tour/copy'
import type { TourPage } from '@/declarations/tour/pages'
import { TOUR_SPOTLIGHT } from '@/declarations/ui/variants'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

export interface StepsTourProps {
  page: TourPage
  onFinish: () => void
  onSkip: () => void
}

/**
 * Lights the parts of a page one after the other, skipping those the member does not have
 * @param {StepsTourProps} props - Page and exits
 * @return {JSX.Element | null}
 */

export const StepsTour = ({ page, onFinish, onSkip }: StepsTourProps) => {
  const { can } = useAuthContext()
  const { playScene } = useTour()
  const [index, setIndex] = useState(0)

  // Only what belongs to the member's access
  const steps = useMemo(
    () =>
      page.steps.filter(
        (entry) =>
          (!entry.permission || can(entry.permission)) && !(entry.without && can(entry.without))
      ),
    [page.steps, can]
  )
  const step = steps[index]
  const isLast = index >= steps.length - 1

  // A part the page does not show is passed over
  const { rect } = useBeaconRect(
    step?.beacon ?? null,
    true,
    isLast ? onFinish : () => setIndex((current) => current + 1)
  )

  // The page plays its example while the step is on
  const scene = step?.scene ?? null
  useEffect(() => {
    playScene(scene)

    return () => playScene(null)
  }, [scene, playScene])

  // Nothing left to say
  useEffect(() => {
    if (!step) onFinish()
  }, [step, onFinish])

  if (!step || !rect) return <TourSpotlight rect={null} isInteractive={false} />

  return (
    <>
      <TourSpotlight rect={rect} isInteractive={false} />
      <TourBubble
        rect={rect}
        title={step.title}
        body={step.body}
        progress={{ index, total: steps.length }}
      >
        <Button variant="ghost" onClick={onSkip}>
          {TOUR_COPY.skipTour}
        </Button>
        <span className={TOUR_SPOTLIGHT.buttons}>
          {index > 0 && (
            <Button onClick={() => setIndex(index - 1)}>{TOUR_COPY.stepPrevious}</Button>
          )}
          <Button variant="primary" onClick={isLast ? onFinish : () => setIndex(index + 1)}>
            {isLast ? TOUR_COPY.stepFinish : TOUR_COPY.stepNext}
          </Button>
        </span>
      </TourBubble>
    </>
  )
}
