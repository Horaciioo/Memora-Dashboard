import { addTransitionType, startTransition } from 'react'
import type { ViewTransitionClass } from 'react'

// Direction of a move
export type StepDirection = 'forward' | 'back'

/**
 * Class per direction
 * @type {ViewTransitionClass}
 */

export const STEP_TRANSITION: ViewTransitionClass = {
  forward: 'step-forward',
  back: 'step-back',
  default: 'none',
}

/**
 * Run a change as a directed transition
 * @param {StepDirection} direction - Way of the move
 * @param {() => void} update - State change
 * @return {void}
 */

export const moveSteps = (direction: StepDirection, update: () => void): void => {
  startTransition(() => {
    addTransitionType(direction)
    update()
  })
}
