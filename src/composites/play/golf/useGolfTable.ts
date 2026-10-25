'use client'

import { useEffect, useRef, useState } from 'react'

import { createRig, teeYaw } from '@/composites/play/golf/scene/rig'
import { createMotion, syncShots } from '@/core/lib/play/golf'
import type { GolfBoardState, GolfHole } from '@/core/lib/play/golf'
import { playTones } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPhaseName, GolfPowerName } from '@/utils/constants/play'

/**
 * Sound of the table when not muted
 * @param {keyof typeof GOLF_SOUNDS} sound - Sound
 * @return {void}
 */

export const playGolfSound = (sound: keyof typeof GOLF_SOUNDS): void => {
  if (!usePlaySoundStore.getState().isMuted) playTones(GOLF_SOUNDS[sound], 1)
}

/**
 * Screen state of a golf table: replays, camera, view and placement, reset at each hole
 * @param {Object} input - Table
 * @param {GolfBoardState} input.board - Board
 * @param {GolfHole} input.hole - Hole
 * @param {GolfPhaseName} input.phase - Stage
 * @param {string} input.viewerId - Screen owner
 * @return {Object} - Motion, rig and view state
 */

export const useGolfTable = ({
  board,
  hole,
  phase,
  viewerId,
}: {
  board: GolfBoardState
  hole: GolfHole
  phase: GolfPhaseName
  viewerId: string
}) => {
  const [seed] = useState(() => ({ motion: createMotion(), rig: createRig(hole) }))
  const motionRef = useRef(seed.motion)
  const rigRef = useRef(seed.rig)
  const [shownHole, setShownHole] = useState(hole)
  const [isOverview, setOverview] = useState(false)
  const [placing, setPlacing] = useState<GolfPowerName | null>(null)

  // A new hole drops the view and the placement
  if (shownHole !== hole) {
    setShownHole(hole)
    setOverview(false)
    setPlacing(null)
  }

  // Strokes of the others replayed
  useEffect(
    () => syncShots(motionRef.current, board.shots, board.serverTime, viewerId),
    [board, viewerId]
  )

  // Every hole starts behind the tee
  useEffect(() => {
    rigRef.current.yaw = teeYaw(hole)
    rigRef.current.isOverview = false
    motionRef.current.tracks.clear()
  }, [hole])

  // Start whistle
  useEffect(() => {
    if (phase === GolfPhases.Playing) playGolfSound('start')
  }, [phase])

  return {
    motionRef,
    rigRef,
    isOverview,
    placing,
    setPlacing,
    toggleView: () => {
      rigRef.current.isOverview = !rigRef.current.isOverview
      setOverview(rigRef.current.isOverview)
    },
  }
}
