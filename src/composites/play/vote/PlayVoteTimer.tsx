'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'

import { GOLF_VOTE_COPY } from '@/declarations/play/golf/vote'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import type { VoteLook } from '@/declarations/ui/variants/games/golf'
import { MINUTE_MS } from '@/utils/constants/time'
import { cn } from '@/utils/classnames'

// Seconds left where the number starts to pulse
const LOW_SECONDS = 5
// Wait before the first retry, doubled each time
const RETRY_MS = 1000
// Longest wait between two tries
const RETRY_MAX_MS = 16000
// Tries before giving up on a step
const MAX_TRIES = 6
// Screen refresh of the number
const TICK_MS = 250

export interface PlayVoteTimerProps {
  // Server ms the step closes
  endsAt: number
  // Server ms at the page render
  serverTime: number
  // Step ran out, anyone may close it
  onExpire: () => void
  // Classes of the screen, Golf's by default
  look?: VoteLook
}

/**
 * Seconds left to vote, read against the server clock, closing the step at zero
 * @param {PlayVoteTimerProps} props - Deadline
 * @return {JSX.Element}
 */

export const PlayVoteTimer = ({
  endsAt,
  serverTime,
  onExpire,
  look = GOLF_VOTE,
}: PlayVoteTimerProps) => {
  const [left, setLeft] = useState(endsAt - serverTime)
  const expire = useEffectEvent(onExpire)

  // Tries survive a new board of the same step, so the backoff holds
  const attempts = useRef({ tries: 0, lastTry: 0 })

  useEffect(() => {
    attempts.current = { tries: 0, lastTry: 0 }
  }, [endsAt])

  useEffect(() => {
    const offset = serverTime - Date.now()
    const id = window.setInterval(() => {
      const state = attempts.current
      const remaining = endsAt - (Date.now() + offset)
      setLeft(remaining)
      const wait = Math.min(RETRY_MAX_MS, RETRY_MS * 2 ** state.tries)
      if (remaining > 0 || state.tries >= MAX_TRIES || Date.now() - state.lastTry < wait) return
      state.lastTry = Date.now()
      state.tries += 1
      expire()
    }, TICK_MS)

    return () => window.clearInterval(id)
  }, [endsAt, serverTime])

  const seconds = Math.max(0, Math.ceil(left / (MINUTE_MS / 60)))

  return (
    <span
      className={cn(look.timer, seconds <= LOW_SECONDS && look.timerLow)}
      role="timer"
      aria-label={GOLF_VOTE_COPY.timer}
    >
      {seconds}
    </span>
  )
}
