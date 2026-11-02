'use client'

import { useEffect, useState } from 'react'

/**
 * Showcase clock
 * @typedef {Object} ShowcaseClock
 * @property {number} step - Current step
 * @property {() => void} replay - Start over
 */

export interface ShowcaseClock {
  step: number
  replay: () => void
}

/**
 * Step by step clock
 * @param {number} last - Final step
 * @param {number} stepMs - Pause per step
 * @return {ShowcaseClock} - Step and replay
 */

export const useShowcaseClock = (last: number, stepMs: number): ShowcaseClock => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= last) return

    // Reduced motion skips ahead
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(() => setStep((current) => current + 1), isReduced ? 0 : stepMs)

    return () => clearTimeout(timer)
  }, [step, last, stepMs])

  return { step, replay: () => setStep(0) }
}
