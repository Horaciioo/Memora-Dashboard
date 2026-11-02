'use client'

import { ShowcaseAssistant } from '@/composites/changelog/showcase/ShowcaseAssistant'
import { ShowcasePages } from '@/composites/changelog/showcase/ShowcasePages'
import { useShowcaseClock } from '@/core/hooks/interaction/useShowcaseClock'
import { SHOWCASE_COPY, SHOWCASE_SETTINGS } from '@/declarations/changelog/showcase'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Animated tour of the version
 * @return {JSX.Element}
 */

export const ReleaseShowcase = () => {
  const { step, replay } = useShowcaseClock(SHOWCASE_SETTINGS.last, SHOWCASE_SETTINGS.stepMs)

  // Scene by step
  const scene =
    step <= SHOWCASE_SETTINGS.assistantEnd ? 0 : step <= SHOWCASE_SETTINGS.pagesEnd ? 1 : 2

  return (
    <section className={SHOWCASE.frame} aria-label={SHOWCASE_COPY.title}>
      <header className={SHOWCASE.head}>
        <h2 className={SHOWCASE.title}>{SHOWCASE_COPY.title}</h2>
        <button type="button" className={SHOWCASE.replay} onClick={replay}>
          {SHOWCASE_COPY.replay}
        </button>
      </header>

      <div className={SHOWCASE.stage}>
        {scene === 0 ? <ShowcaseAssistant step={step} /> : <ShowcasePages step={step} />}
      </div>

      <p className={SHOWCASE.caption} aria-live="polite">
        {SHOWCASE_COPY.captions[scene]}
      </p>
      <div className={SHOWCASE.dots} aria-hidden="true">
        {SHOWCASE_COPY.captions.map((caption, index) => (
          <span key={caption} className={cn(SHOWCASE.dot, index <= scene && SHOWCASE.dotOn)} />
        ))}
      </div>
    </section>
  )
}
