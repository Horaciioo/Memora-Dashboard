'use client'

import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import { SplashWord } from '@/composites/splash/SplashWord'
import { useSplash } from '@/core/hooks/interaction/useSplash'
import { SPLASH } from '@/declarations/ui/blocks'
import { SPLASH_COPY } from '@/declarations/ui/copy/feedback'
import { SPLASH_EYE } from '@/declarations/ui/splash'

/**
 * Brand screen over the first load
 * @return {JSX.Element | null}
 */

export const BrandSplash = () => {
  const { phase, progress, skip } = useSplash()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Aim the dive at the hole of the e
  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const letter = overlay?.querySelectorAll<HTMLElement>('.splash-letter')[SPLASH_EYE.letter]

    if (phase !== 'exit' || !overlay || !letter) return

    const box = letter.getBoundingClientRect()
    const size = parseFloat(getComputedStyle(letter).fontSize)
    const measures = {
      '--splash-eye-x': box.left + SPLASH_EYE.x * size,
      '--splash-eye-y': box.top + SPLASH_EYE.y * size,
      '--splash-rx': SPLASH_EYE.rx * size * SPLASH_EYE.fit,
      '--splash-ry': SPLASH_EYE.ry * size * SPLASH_EYE.fit,
    }

    Object.entries(measures).forEach(([name, value]) =>
      overlay.style.setProperty(name, `${value}px`)
    )
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      ref={overlayRef}
      className={SPLASH.overlay}
      data-phase={phase}
      style={{ '--splash-progress': progress } as CSSProperties}
      aria-hidden="true"
      onClick={skip}
    >
      <div className={SPLASH.ground}>
        <span />
        <span />
      </div>
      <div className={SPLASH.camera}>
        <i />
        <i />
        <i />
        <i />
        <div className={SPLASH.body}>
          <SplashWord />
          <span className={SPLASH.label}>{SPLASH_COPY.status}</span>
        </div>
      </div>
    </div>
  )
}
