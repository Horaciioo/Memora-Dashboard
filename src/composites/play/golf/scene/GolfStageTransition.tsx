'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import { stageBallSpot, stageFrame } from '@/composites/play/golf/scene/stage'
import type { GolfStageSpot } from '@/composites/play/golf/scene/stage'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { playGolfSound } from '@/composites/play/golf/sound'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { transition: look } = GOLF_SCENE

export interface GolfStageTransitionProps {
  rigRef: RefObject<GolfRig>
  // Hole closed, server ms, none while it runs
  closedAt: number | null
  serverNow: () => number
  // Players still on the course or in the cup
  playerIds: string[]
  // Next tee on the same map, none when the course changes
  nextTee: GolfStageSpot | null
  // Last hole of the game: the victory takes over
  isLast: boolean
}

/**
 * End of a hole: ready sound, framing on the balls, a hop each, then the flight to the next tee
 * @param {GolfStageTransitionProps} props - Clock and balls
 * @return {null}
 */

export const GolfStageTransition = ({
  rigRef,
  closedAt,
  serverNow,
  playerIds,
  nextTee,
  isLast,
}: GolfStageTransitionProps) => {
  const hasSounded = useRef<number | null>(null)
  const center = useRef(new Vector3())
  // Short version: the balls stay, the next hole fades in
  const isStill = useRef(false)
  useEffect(() => {
    isStill.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  // Sequence dropped with the scene
  useEffect(
    () => () => {
      rigRef.current.stage = null
      rigRef.current.pin = null
    },
    [rigRef]
  )

  useFrame(() => {
    const rig = rigRef.current
    const seconds = closedAt === null ? -1 : (serverNow() - closedAt) / 1000
    // Held until the next hole arrives, so the balls wait on the tee
    const isOn = !isLast && !isStill.current && seconds >= 0
    if (!isOn) {
      rig.stage = null
      rig.pin = null
      return
    }

    // Spots taken once, when the hole closes
    if (!rig.stage) {
      const from = new Map<string, GolfStageSpot>()
      playerIds.forEach((id) => {
        const spot = rig.spots.get(id)
        if (spot) from.set(id, { x: spot.x, y: spot.y, z: spot.z })
      })
      rig.stage = {
        seconds,
        from,
        ranks: new Map(playerIds.map((id, rank) => [id, rank])),
        to: nextTee,
      }
    }
    rig.stage.seconds = seconds
    if (hasSounded.current !== closedAt) {
      hasSounded.current = closedAt
      playGolfSound('stage')
    }

    // Framing follows the balls where they are drawn
    const { from, ranks, to } = rig.stage
    const spots = [...from.entries()].map(([id, spot]) =>
      stageBallSpot(spot, to, seconds, ranks.get(id) ?? 0)
    )
    const frame = stageFrame(to && seconds > look.prep + look.gather ? [...spots, to] : spots)
    // Course change: the view climbs once the hop is done
    const climb = !to && seconds > look.prep + look.gather + look.bounce ? look.climb : 1
    center.current.set(frame.x, 0, frame.z)
    rig.pin = { center: center.current, reach: frame.reach * climb }
  })

  return null
}
