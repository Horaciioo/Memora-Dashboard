'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

import { COURSE_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_STAMP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Colours of the confetti, Apple's three and the brand pink
const CONFETTI_COLOURS = [
  'var(--color-apple-red)',
  'var(--color-apple-orange)',
  'var(--color-apple-green)',
  'var(--color-brand-600)',
]

export interface CourseCeremonyProps {
  courseId: string
  onDone: () => void
}

/**
 * Course done: congratulation, the stamp slams with confetti, then flies onto its card
 * @param {string} courseId - Course celebrated
 * @param {() => void} onDone - Ceremony over
 * @return {JSX.Element | null}
 */

export const CourseCeremony = ({ courseId, onDone }: CourseCeremonyProps) => {
  const [phase, setPhase] = useState<'wait' | 'slam' | 'fly'>('wait')
  const [flight, setFlight] = useState<string | undefined>(undefined)
  const stampRef = useRef<HTMLDivElement>(null)

  // Card fills first, then the stamp, then its flight
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('slam'), ACADEMY_SETTINGS.ceremonyFillMs),
      window.setTimeout(() => {
        const stamp = stampRef.current?.getBoundingClientRect()
        const card = document
          .querySelector(`[data-course-poster="${courseId}"]`)
          ?.getBoundingClientRect()

        // Straight onto the card banner, shrunk to its size
        if (stamp && card) {
          const x = card.left + card.width / 2 - (stamp.left + stamp.width / 2)
          const y = card.top + card.height / 2 - (stamp.top + stamp.height / 2)
          setFlight(`translate(${x}px, ${y}px) scale(0.45) rotate(-8deg)`)
        }
        setPhase('fly')
      }, ACADEMY_SETTINGS.ceremonyFillMs + ACADEMY_SETTINGS.ceremonySlamMs),
      window.setTimeout(
        onDone,
        ACADEMY_SETTINGS.ceremonyFillMs +
          ACADEMY_SETTINGS.ceremonySlamMs +
          ACADEMY_SETTINGS.ceremonyFlyMs
      ),
    ]

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [courseId, onDone])

  if (phase === 'wait') return null

  return (
    <div className={COURSE_STAMP.overlay} aria-live="polite">
      <div className={cn(COURSE_STAMP.veil, phase === 'fly' && COURSE_STAMP.veilGone)} />
      {phase === 'slam' && <p className={COURSE_STAMP.cheer}>{COURSE_COPY.cheer}</p>}
      <div
        ref={stampRef}
        className={cn(
          COURSE_STAMP.stamp,
          COURSE_STAMP.stampSlam,
          phase === 'fly' && COURSE_STAMP.stampFly
        )}
        style={flight ? { transform: flight } : undefined}
      >
        {COURSE_COPY.stamp}
      </div>
      {phase === 'slam' &&
        Array.from({ length: ACADEMY_SETTINGS.ceremonyConfetti }, (_, index) => {
          // Even spread around the stamp, a little jitter by index
          const angle = (index / ACADEMY_SETTINGS.ceremonyConfetti) * Math.PI * 2
          const reach = ACADEMY_SETTINGS.ceremonyBurstPx * (0.55 + ((index * 37) % 45) / 100)

          return (
            <span
              key={index}
              className={COURSE_STAMP.confetti}
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
  )
}
