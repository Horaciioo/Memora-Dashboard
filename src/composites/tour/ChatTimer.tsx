'use client'

import { useEffect, useState } from 'react'

import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'

export interface ChatTimerProps {
  // Wait it counts down
  ms: number
}

/**
 * Countdown to the next part, a ring that empties around the seconds left
 * @param {ChatTimerProps} props - Wait to count
 * @return {JSX.Element}
 */

export const ChatTimer = ({ ms }: ChatTimerProps) => {
  const [seconds, setSeconds] = useState(Math.ceil(ms / 1000))
  const [isRunning, setRunning] = useState(false)

  // The ring starts on the next frame so it animates
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRunning(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((left) => Math.max(left - 1, 0)), 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className={TOUR_CHAT.timer} role="timer" aria-label={TOUR_COPY.inputWaiting}>
      <svg className={TOUR_CHAT.timerRing} viewBox="0 0 36 36" aria-hidden="true">
        <circle className={TOUR_CHAT.timerTrack} cx="18" cy="18" r="16" />
        <circle
          className={TOUR_CHAT.timerFill}
          cx="18"
          cy="18"
          r="16"
          pathLength={1}
          style={{
            strokeDashoffset: isRunning ? 1 : 0,
            transitionDuration: `${ms}ms`,
          }}
        />
      </svg>
      <span className={TOUR_CHAT.timerSeconds}>{seconds}</span>
    </span>
  )
}
