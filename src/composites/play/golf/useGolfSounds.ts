'use client'

import { useEffect, useRef } from 'react'

import { playGolfSound, playPowerChime } from '@/composites/play/golf/sound'
import type { GolfCue, GolfCueKind } from '@/core/hooks/interaction/golf/useGolfPowerCue'
import { preloadSounds } from '@/core/lib/play/sounds'
import type { GolfBoardState } from '@/core/lib/play/golf'
import { GOLF_POWER_SOUNDS, GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import type { GolfSoundName } from '@/declarations/play/golf/sounds'

// Played powers sound when used
const CUE_SOUNDS: Record<GolfCueKind, GolfSoundName | null> = {
  gained: 'reveal',
  used: null,
  ended: 'ended',
}

/**
 * Power cues, rival powers
 * @param {Object} input - Table
 * @param {GolfBoardState} input.board - Board
 * @param {string} input.viewerId - Screen owner
 * @param {GolfCue | null} input.cue - Power cue
 * @return {void}
 */

export const useGolfSounds = ({
  board,
  viewerId,
  cue,
}: {
  board: GolfBoardState
  viewerId: string
  cue: GolfCue | null
}): void => {
  // Lines already heard, none at first render
  const heard = useRef<Set<string> | null>(null)

  // Files ready before the first shot
  useEffect(() => preloadSounds(Object.values(GOLF_SOUNDS)), [])

  // Power card sound
  useEffect(() => {
    const sound = cue && CUE_SOUNDS[cue.kind]
    if (sound) playGolfSound(sound)
    if (cue?.kind === 'gained') playPowerChime()
  }, [cue])

  // Powers played by the others
  useEffect(() => {
    const known = heard.current
    heard.current = new Set(board.feed.map((line) => line.id))
    if (!known) return
    const played = board.feed.find(
      (line) => line.kind === 'POWER' && line.accountId !== viewerId && !known.has(line.id)
    )
    if (played) playGolfSound((played.power && GOLF_POWER_SOUNDS[played.power]) ?? 'power')
  }, [board.feed, viewerId])
}
