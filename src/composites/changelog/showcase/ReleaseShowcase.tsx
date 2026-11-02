'use client'

import { ShowcaseAbsences } from '@/composites/changelog/showcase/ShowcaseAbsences'
import { ShowcaseCard } from '@/composites/changelog/showcase/ShowcaseCard'
import { ShowcasePages } from '@/composites/changelog/showcase/ShowcasePages'
import { ShowcaseWindow } from '@/composites/changelog/showcase/ShowcaseWindow'
import { useShowcaseClock } from '@/core/hooks/interaction/useShowcaseClock'
import { SHOWCASE_COPY, SHOWCASE_SETTINGS, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Dots under the stage
const SCENES = 3

// Sparks of the closing burst
const FINALE_SPARKS = 28

/**
 * Teaser of the version, from the first chat to the invitations
 * @return {JSX.Element}
 */

export const ReleaseShowcase = () => {
  const { step, replay } = useShowcaseClock(SHOWCASE_SETTINGS.last, SHOWCASE_SETTINGS.stepMs)
  const { introEnd, assistantEnd, pagesEnd } = SHOWCASE_SETTINGS

  // Beat by step
  const scene = step <= assistantEnd ? 0 : step <= pagesEnd ? 1 : 2
  const isPages = scene > 0

  return (
    <div className={SHOWCASE.root}>
      <div className={SHOWCASE.stage} aria-hidden="true">
        <ShowcaseWindow active={isPages ? 'pages' : 'absences'}>
          {isPages ? <ShowcasePages step={step} /> : <ShowcaseAbsences step={step} />}
        </ShowcaseWindow>
        <ShowcaseCard isOn={step <= introEnd} />
        <ShowcaseCard isFinale isOn={step >= SHOWCASE_STEPS.finale} sparks={FINALE_SPARKS} />
      </div>

      <div className={SHOWCASE.dots} aria-hidden="true">
        {Array.from({ length: SCENES }, (_, index) => (
          <span key={index} className={cn(SHOWCASE.dot, index <= scene && SHOWCASE.dotOn)} />
        ))}
      </div>
      <button type="button" className={SHOWCASE.replay} onClick={replay}>
        {SHOWCASE_COPY.replay}
      </button>
    </div>
  )
}
