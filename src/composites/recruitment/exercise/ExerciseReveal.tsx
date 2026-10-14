'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { EXERCISES } from '@/declarations/recruitment/exercises'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import type { ExerciseKey } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'

export interface ExerciseRevealProps {
  exercise: ExerciseKey
  // Exercises flickering by before the draw lands
  shuffle?: ExerciseKey[]
  onDone: () => void
}

/**
 * Title of the chosen exercise filling the window
 * @param {ExerciseRevealProps} props - Component props
 * @return {JSX.Element}
 */

export const ExerciseReveal = ({ exercise, shuffle, onDone }: ExerciseRevealProps) => {
  const [shown, setShown] = useState<ExerciseKey>(shuffle?.[0] ?? exercise)
  const spin = shuffle ? EXERCISE_SETTINGS.shuffleMs : 0
  const total = spin + EXERCISE_SETTINGS.revealMs

  // Flicker then land
  useEffect(() => {
    if (!shuffle) return

    let step = 0
    const flicker = setInterval(() => {
      step += 1
      setShown(shuffle[step % shuffle.length] ?? exercise)
    }, EXERCISE_SETTINGS.shuffleStepMs)
    const land = setTimeout(() => {
      clearInterval(flicker)
      setShown(exercise)
    }, spin)

    return () => {
      clearInterval(flicker)
      clearTimeout(land)
    }
  }, [shuffle, exercise, spin])

  // Hand over to the page
  useEffect(() => {
    const done = setTimeout(onDone, total)

    return () => clearTimeout(done)
  }, [onDone, total])

  return (
    <div
      className={EXERCISE_STYLES.reveal}
      style={{ '--reveal-ms': `${total}ms` } as CSSProperties}
      aria-live="polite"
    >
      <span className={EXERCISE_STYLES.revealKicker}>{EXERCISE_COPY.revealKicker}</span>
      <h2 key={shown} className={EXERCISE_STYLES.revealTitle}>
        {EXERCISES[shown].label}
      </h2>
    </div>
  )
}
