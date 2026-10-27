'use client'

import { useEffect, useEffectEvent, useState } from 'react'

import { GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import { MINUTE_MS } from '@/utils/constants/time'
import { cn } from '@/utils/classnames'

// Seconds left where the number starts to pulse
const LOW_SECONDS = 5
// Wait between two tries to close a step that ran out
const RETRY_MS = 1000
// Screen refresh of the number
const TICK_MS = 250

export interface GolfVoteTimerProps {
  // Server ms the step closes
  endsAt: number
  // Server ms at the page render
  serverTime: number
  // Step ran out, anyone may close it
  onExpire: () => void
}

/**
 * Seconds left to vote, read against the server clock, closing the step at zero
 * @param {GolfVoteTimerProps} props - Deadline
 * @return {JSX.Element}
 */

export const GolfVoteTimer = ({ endsAt, serverTime, onExpire }: GolfVoteTimerProps) => {
  const [left, setLeft] = useState(endsAt - serverTime)
  const expire = useEffectEvent(onExpire)

  useEffect(() => {
    const offset = serverTime - Date.now()
    let lastTry = 0
    const id = window.setInterval(() => {
      const remaining = endsAt - (Date.now() + offset)
      setLeft(remaining)
      if (remaining > 0 || Date.now() - lastTry < RETRY_MS) return
      lastTry = Date.now()
      expire()
    }, TICK_MS)

    return () => window.clearInterval(id)
  }, [endsAt, serverTime])

  const seconds = Math.max(0, Math.ceil(left / (MINUTE_MS / 60)))

  return (
    <span
      className={cn(GOLF_VOTE.timer, seconds <= LOW_SECONDS && GOLF_VOTE.timerLow)}
      role="timer"
      aria-label={GOLF_VOTE_COPY.timer}
    >
      {seconds}
    </span>
  )
}
