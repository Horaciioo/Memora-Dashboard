'use client'

import { useEffect, useMemo, useState } from 'react'

import { PLAY_XP_TIMING } from '@/declarations/play/xp'
import type { PlayLevelView, PlayRewardLadder } from '@/types/play'

// Delay between two segments, so the empty bar paints first
const RESET_MS = 60

/**
 * Share of a level already climbed
 * @param {PlayLevelView} level - Standing
 * @return {number} - Between 0 and 1
 */

const shareOf = ({ into, needed }: PlayLevelView): number => (needed ? into / needed : 1)

/**
 * Bar filling from the old standing to the new one, through the level up when there is one
 * @param {PlayRewardLadder} ladder - Standing before and after
 * @return {{ level: number, share: number, isFilling: boolean, hasLeveled: boolean }} - Bar state
 */

export const usePlayXpFill = ({ before, after }: PlayRewardLadder) => {
  const segments = useMemo(
    () =>
      before.level === after.level
        ? [{ level: before.level, from: shareOf(before), to: shareOf(after) }]
        : [
            { level: before.level, from: shareOf(before), to: 1 },
            { level: after.level, from: 0, to: shareOf(after) },
          ],
    [before, after]
  )
  const [state, setState] = useState({ index: 0, isFilling: false })

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let at = PLAY_XP_TIMING.startMs

    segments.forEach((_, index) => {
      if (index) {
        timers.push(setTimeout(() => setState({ index, isFilling: false }), at))
        at += RESET_MS
      }
      timers.push(setTimeout(() => setState({ index, isFilling: true }), at))
      at += PLAY_XP_TIMING.fillMs + PLAY_XP_TIMING.pauseMs
    })

    return () => timers.forEach(clearTimeout)
  }, [segments])

  const segment = segments[state.index]

  return {
    level: segment.level,
    share: state.isFilling ? segment.to : segment.from,
    isFilling: state.isFilling,
    hasLeveled: state.index > 0,
  }
}
