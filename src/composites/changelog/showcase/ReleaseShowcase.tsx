'use client'

import { useRef } from 'react'

import { ShowcaseAbsences } from '@/composites/changelog/showcase/ShowcaseAbsences'
import { ShowcaseCard } from '@/composites/changelog/showcase/ShowcaseCard'
import { ShowcaseControls } from '@/composites/changelog/showcase/ShowcaseControls'
import { ShowcaseCursor } from '@/composites/changelog/showcase/ShowcaseCursor'
import { ShowcasePage } from '@/composites/changelog/showcase/ShowcasePage'
import { ShowcaseRail } from '@/composites/changelog/showcase/ShowcaseRail'
import { useFitScale } from '@/core/hooks/interaction/layout/useFitScale'
import { useShowcaseClock } from '@/core/hooks/interaction/useShowcaseClock'
import { SHOWCASE_SETTINGS, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { SHOWCASE } from '@/declarations/ui/variants'

// Sparks of the closing burst
const FINALE_SPARKS = 28

/**
 * Presentation video of the version, played once the app shows
 * @return {JSX.Element}
 */

export const ReleaseShowcase = () => {
  const clock = useShowcaseClock(SHOWCASE_SETTINGS.last, SHOWCASE_SETTINGS.stepMs)
  const { ref, scale } = useFitScale(SHOWCASE_SETTINGS.width)
  const dashRef = useRef<HTMLDivElement>(null)
  const { step } = clock
  const isPage = step >= SHOWCASE_STEPS.create

  return (
    <div className={SHOWCASE.player}>
      <div
        ref={ref}
        className={SHOWCASE.stage}
        style={{ height: SHOWCASE_SETTINGS.height * scale }}
        onClick={clock.toggle}
        aria-hidden="true"
      >
        <div
          ref={dashRef}
          className={SHOWCASE.dash}
          style={{
            width: SHOWCASE_SETTINGS.width,
            height: SHOWCASE_SETTINGS.height,
            transform: `scale(${scale})`,
          }}
        >
          <div className={SHOWCASE.dashRoot}>
            <ShowcaseRail step={step} />
            <div className={SHOWCASE.main}>
              {isPage ? <ShowcasePage step={step} /> : <ShowcaseAbsences step={step} />}
            </div>
          </div>
          <ShowcaseCursor step={step} scale={scale} rootRef={dashRef} />
        </div>
        <ShowcaseCard isOn={step <= SHOWCASE_SETTINGS.introEnd} />
        <ShowcaseCard isFinale isOn={step >= SHOWCASE_STEPS.finale} sparks={FINALE_SPARKS} />
      </div>
      <ShowcaseControls clock={clock} />
    </div>
  )
}
