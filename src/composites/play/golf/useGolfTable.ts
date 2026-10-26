'use client'

import { useEffect, useRef, useState } from 'react'

import { createRig, teeYaw } from '@/composites/play/golf/scene/rig'
import { createMotion, syncShots } from '@/core/lib/play/golf'
import type { GolfBoardState, GolfHole } from '@/core/lib/play/golf'
import { GolfPhases } from '@/utils/constants/play'
import type { GolfPhaseName, GolfPowerName } from '@/utils/constants/play'

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
  const [isOverview, setOverview] = useState(phase === GolfPhases.Countdown)
  // Power waiting for a spot, with its slot in hand
  const [placing, setPlacing] = useState<{ power: GolfPowerName; slot: number } | null>(null)
  const [isStatsOpen, setStatsOpen] = useState(false)

  // A new hole drops the view and the placement
  if (shownHole !== hole) {
    setShownHole(hole)
    setOverview(false)
    setPlacing(null)
  }

  // Intro view follows the stage
  const [shownPhase, setShownPhase] = useState(phase)
  if (shownPhase !== phase) {
    setShownPhase(phase)
    setOverview(phase === GolfPhases.Countdown)
  }

  // Strokes of the others replayed
  useEffect(
    () => syncShots(motionRef.current, board.shots, board.serverTime, viewerId),
    [board, viewerId]
  )

  // Every hole starts behind the tee
  useEffect(() => {
    rigRef.current.yaw = teeYaw(hole)
    motionRef.current.tracks.clear()
  }, [hole])

  // Whole hole shown before the start, then down to the tee
  useEffect(() => {
    rigRef.current.isOverview = phase === GolfPhases.Countdown
  }, [phase])

  return {
    motionRef,
    rigRef,
    isOverview,
    placing,
    setPlacing,
    isStatsOpen,
    setStatsOpen,
    toggleView: () => {
      rigRef.current.isOverview = !rigRef.current.isOverview
      setOverview(rigRef.current.isOverview)
    },
  }
}
