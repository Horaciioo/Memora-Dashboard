'use client'

import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'

import { playGolfSound } from '@/composites/play/golf/sound'
import { winningCard } from '@/core/lib/play/golf'
import type { GolfGameSettings, GolfVoteState } from '@/core/lib/play/golf'
import { preloadSounds } from '@/core/lib/play/sounds'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import { GOLF_VOTE_TIMING, GolfVoteActions } from '@/declarations/play/golf/vote'

// Sounds of the vote, fetched on open
const VOTE_SOUNDS = [
  GOLF_SOUNDS.voteChoice,
  GOLF_SOUNDS.voteHop,
  GOLF_SOUNDS.voteConfirm,
  GOLF_SOUNDS.voteBack,
  GOLF_SOUNDS.voteSwitch,
]

export interface GolfVoteInput {
  vote: GolfVoteState
  settings: GolfGameSettings
  viewerId: string
  hostId: string
  isHost: boolean
  // Sends one action to the vote route
  onSend: (payload: Record<string, unknown>) => void
}

/**
 * Vote of the lobby: own pick shown at once, card most picked, gestures with their sounds
 * @param {GolfVoteInput} input - Vote and sender
 * @return {Object} - Picks, leading card and gestures
 */

export const useGolfVote = ({
  vote,
  settings,
  viewerId,
  hostId,
  isHost,
  onSend,
}: GolfVoteInput) => {
  // Own pick, shown before the server answers
  const [mine, setMine] = useState<{ step: string; key: string } | null>(null)
  const timers = useRef<number[]>([])
  const picks = mine?.step === vote.step ? { ...vote.picks, [viewerId]: mine.key } : vote.picks
  const leader = winningCard(vote.step, picks, hostId, settings)

  // Files ready, timers cleared on leave
  useEffect(() => {
    preloadSounds(VOTE_SOUNDS)
    const pending = timers.current

    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  useEffect(() => playGolfSound('voteSwitch'), [vote.step])

  const pick = useCallback(
    (key: string) => {
      playGolfSound('voteChoice')
      // The avatar lands a moment later
      timers.current.push(window.setTimeout(() => playGolfSound('voteHop'), GOLF_VOTE_TIMING.land))
      setMine({ step: vote.step, key })
      onSend({ action: GolfVoteActions.Pick, key })
    },
    [vote.step, onSend]
  )

  const close = useCallback(
    () => onSend({ action: GolfVoteActions.Close, step: vote.step }),
    [vote.step, onSend]
  )

  const validate = () => {
    playGolfSound('voteConfirm')
    close()
  }

  const back = () => {
    playGolfSound('voteBack')
    onSend({ action: GolfVoteActions.Cancel })
  }

  // Escape drops the vote, the host's call
  const onEscape = useEffectEvent(() => isHost && back())
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onEscape()
    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { picks, leader, pick, close, validate, back }
}
