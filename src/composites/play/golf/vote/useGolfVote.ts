'use client'

import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'

import { playGolfSound } from '@/composites/play/golf/sound'
import { holeRange } from '@/core/lib/play/golf'
import type { GolfGameSettings } from '@/core/lib/play/golf'
import { preloadSounds } from '@/core/lib/play/sounds'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import { GOLF_VOTE_TIMING, GolfVoteSteps } from '@/declarations/play/golf/vote'
import type { GolfVoteStep } from '@/declarations/play/golf/vote'
import { GolfModes } from '@/utils/constants/play'
import type { GolfModeName } from '@/utils/constants/play'

// Sounds of the vote, fetched on open
const VOTE_SOUNDS = [
  GOLF_SOUNDS.voteChoice,
  GOLF_SOUNDS.voteHop,
  GOLF_SOUNDS.voteConfirm,
  GOLF_SOUNDS.voteBack,
  GOLF_SOUNDS.voteSwitch,
]

/**
 * Steps a format goes through
 * @param {GolfModeName} mode - Format
 * @return {GolfVoteStep[]} - Steps in order
 */

const stepsOf = (mode: GolfModeName): GolfVoteStep[] =>
  mode === GolfModes.Tournament
    ? [GolfVoteSteps.Mode, GolfVoteSteps.Rounds, GolfVoteSteps.Course]
    : [GolfVoteSteps.Mode, GolfVoteSteps.Course]

/**
 * Vote after the rules: format, tournament length, course, each pick and move with its sound
 * @param {Object} input - Vote
 * @param {GolfGameSettings} input.settings - Rules chosen so far
 * @param {() => void} input.onBack - Leave toward the rules
 * @param {(settings: GolfGameSettings) => void} input.onConfirm - Final settings
 * @return {Object} - Step, picks and gestures
 */

export const useGolfVote = ({
  settings,
  onBack,
  onConfirm,
}: {
  settings: GolfGameSettings
  onBack: () => void
  onConfirm: (settings: GolfGameSettings) => void
}) => {
  const [step, setStep] = useState<GolfVoteStep>(GolfVoteSteps.Mode)
  const [isLeaving, setLeaving] = useState(false)
  const [choice, setChoice] = useState({
    mode: settings.mode,
    maps: settings.maps,
    course: settings.course,
  })
  const timers = useRef<number[]>([])
  const steps = stepsOf(choice.mode)
  const later = useCallback((action: () => void, ms: number) => {
    timers.current.push(window.setTimeout(action, ms))
  }, [])

  // Files ready, timers cleared on leave
  useEffect(() => {
    preloadSounds(VOTE_SOUNDS)
    const pending = timers.current

    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  // Cards leave, then the next step comes in
  const go = (target: GolfVoteStep) => {
    later(() => {
      playGolfSound('voteSwitch')
      setLeaving(true)
    }, GOLF_VOTE_TIMING.confirm)
    later(() => {
      setStep(target)
      setLeaving(false)
    }, GOLF_VOTE_TIMING.confirm + GOLF_VOTE_TIMING.exit)
  }

  const pick = (key: string) => {
    if (isLeaving) return
    playGolfSound('voteChoice')
    // The avatar lands a moment later
    later(() => playGolfSound('voteHop'), GOLF_VOTE_TIMING.land)
    if (step === GolfVoteSteps.Mode)
      setChoice((current) => ({ ...current, mode: key as GolfModeName }))
    else if (step === GolfVoteSteps.Rounds)
      setChoice((current) => ({ ...current, maps: Number(key) }))
    else setChoice((current) => ({ ...current, course: key }))
  }

  const confirm = () => {
    if (isLeaving) return
    playGolfSound('voteConfirm')
    const next = steps[steps.indexOf(step) + 1]
    if (next) return go(next)
    // Last step starts the game
    onConfirm({
      ...settings,
      ...choice,
      holes: Math.min(settings.holes, holeRange(choice.course).max),
    })
  }

  const back = () => {
    if (isLeaving) return
    playGolfSound('voteBack')
    const previous = steps[steps.indexOf(step) - 1]
    if (previous) return go(previous)
    onBack()
  }

  // Escape goes back one step
  const onEscape = useEffectEvent(back)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onEscape()
    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { step, steps, choice, isLeaving, pick, confirm, back }
}
