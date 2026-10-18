'use client'

import { useCallback, useState } from 'react'

import { pickAtRandom } from '@/core/lib/recruitment/exercises'
import type { ExerciseKey } from '@/declarations/recruitment/questionnaire'

/**
 * Title on screen while the page arrives
 * @typedef {Object} ExerciseReveal
 * @property {ExerciseKey} exercise - Exercise landing
 * @property {ExerciseKey[]} [shuffle] - Titles flickering by first
 */

export interface ExercisePickReveal {
  exercise: ExerciseKey
  shuffle?: ExerciseKey[]
}

/**
 * Exercise pick state
 * @typedef {Object} ExercisePick
 * @property {ExerciseKey | null} chosen - Exercise opened
 * @property {ExercisePickReveal | null} reveal - Title animation in progress
 * @property {(exercise: ExerciseKey) => void} pick - Open one
 * @property {() => void} random - Open one drawn at random
 * @property {() => void} clear - Back to the choice
 * @property {() => void} endReveal - Animation over
 */

export interface ExercisePick {
  chosen: ExerciseKey | null
  reveal: ExercisePickReveal | null
  pick: (exercise: ExerciseKey) => void
  random: () => void
  clear: () => void
  endReveal: () => void
}

/**
 * Drive the choice of an exercise among those on offer
 * @param {ExerciseKey[]} offered - Exercises on offer
 * @return {ExercisePick} - State and gestures
 */

export const useExercisePick = (offered: ExerciseKey[]): ExercisePick => {
  const [chosen, setChosen] = useState<ExerciseKey | null>(null)
  const [reveal, setReveal] = useState<ExercisePickReveal | null>(null)

  const open = useCallback((exercise: ExerciseKey, shuffle?: ExerciseKey[]) => {
    setChosen(exercise)
    setReveal({ exercise, shuffle })
  }, [])

  const random = useCallback(() => {
    const drawn = pickAtRandom(offered)
    if (drawn) open(drawn, offered)
  }, [offered, open])

  return {
    chosen,
    reveal,
    pick: open,
    random,
    clear: useCallback(() => setChosen(null), []),
    endReveal: useCallback(() => setReveal(null), []),
  }
}
