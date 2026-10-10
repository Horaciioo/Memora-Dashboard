'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CELEBRATION } from '@/declarations/ui/variants'
import { useTour } from '@/managers/front-end/TourManager'

// Colours of the confetti
const CONFETTI_COLOURS = [
  'var(--color-apple-red)',
  'var(--color-apple-orange)',
  'var(--color-apple-green)',
  'var(--color-brand-600)',
]

/**
 * The visit is over: the stamp of a finished course slams in the middle of the screen
 * @return {JSX.Element}
 */

export const TourCelebration = () => {
  const router = useRouter()
  const { endCelebration } = useTour()

  const open = () => {
    endCelebration()
    router.push(ROUTES.trainings)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TOUR_COPY.doneTitle}
      className={TOUR_CELEBRATION.overlay}
    >
      <div className={TOUR_CELEBRATION.veil} />
      <div className={TOUR_CELEBRATION.panel}>
        <h2 className={TOUR_CELEBRATION.title}>{TOUR_COPY.doneTitle}</h2>
        <div className={TOUR_CELEBRATION.stage}>
          <span className={TOUR_CELEBRATION.stamp}>{COURSE_COPY.stamp}</span>
          {Array.from({ length: ACADEMY_SETTINGS.ceremonyConfetti }, (_, index) => {
            // Even spread around the stamp
            const angle = (index / ACADEMY_SETTINGS.ceremonyConfetti) * Math.PI * 2
            const reach = ACADEMY_SETTINGS.ceremonyBurstPx * (0.55 + ((index * 37) % 45) / 100)

            return (
              <span
                key={index}
                className={TOUR_CELEBRATION.confetti}
                style={
                  {
                    background: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
                    '--confetti-x': `${Math.cos(angle) * reach}px`,
                    '--confetti-y': `${Math.sin(angle) * reach}px`,
                    '--confetti-r': `${(index * 47) % 360}deg`,
                  } as CSSProperties
                }
              />
            )
          })}
        </div>
        <p className={TOUR_CELEBRATION.body}>{TOUR_COPY.doneCourse}</p>
        <div className={TOUR_CELEBRATION.actions}>
          <Button variant="secondary" onClick={endCelebration}>
            {TOUR_COPY.doneClose}
          </Button>
          <Button onClick={open}>{TOUR_COPY.doneOpen}</Button>
        </div>
      </div>
    </div>
  )
}
