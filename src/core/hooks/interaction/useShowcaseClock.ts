'use client'

import { useEffect, useState } from 'react'

/**
 * Showcase clock state
 * @typedef {Object} ShowcaseClock
 * @property {number} step - Current step
 * @property {boolean} isPaused - Held
 * @property {boolean} isEnded - Past the last step
 * @property {() => void} toggle - Pause or resume, replay at the end
 * @property {(step: number) => void} seek - Jump to a step
 */

export interface ShowcaseClock {
  step: number
  isPaused: boolean
  isEnded: boolean
  toggle: () => void
  seek: (step: number) => void
}

/**
 * Step by step clock
 * @param {number} last - Final step
 * @param {number} stepMs - Pause per step
 * @return {ShowcaseClock} - Step and controls
 */

export const useShowcaseClock = (last: number, stepMs: number): ShowcaseClock => {
  const [step, setStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isEnded = step >= last

  useEffect(() => {
    if (isEnded || isPaused) return

    // Reduced motion skips ahead
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(() => setStep((current) => current + 1), isReduced ? 0 : stepMs)

    return () => clearTimeout(timer)
  }, [step, isEnded, isPaused, stepMs])

  const toggle = () => {
    if (isEnded) setStep(0)
    else setIsPaused((current) => !current)
  }

  return { step, isPaused, isEnded, toggle, seek: setStep }
}
