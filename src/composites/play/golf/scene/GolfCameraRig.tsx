'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'

import { cameraSpot, clampDistance, overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { camera } = GOLF_SETTINGS

/**
 * Camera following a ball, or over the whole hole
 * @param {Object} props - Rig
 * @param {RefObject<GolfRig>} props.rigRef - Shared rig
 * @param {GolfHole} props.hole - Hole
 * @param {string | null} props.focusId - Ball followed
 * @return {null}
 */

export const GolfCameraRig = ({
  rigRef,
  hole,
  focusId,
}: {
  rigRef: RefObject<GolfRig>
  hole: GolfHole
  focusId: string | null
}) => {
  const overview = useMemo(() => overviewOf(hole), [hole])
  const tee = useMemo(() => new Vector3(hole.tee[0], 0, hole.tee[1]), [hole])
  const spot = useRef(new Vector3())

  useFrame(({ camera: view }, delta) => {
    const rig = rigRef.current
    // Held keys turn and zoom
    rig.yaw += rig.turn * camera.turnSpeed * delta
    rig.distance = clampDistance(rig.distance * Math.exp(rig.zoom * camera.keyZoom * delta))

    const followed = focusId ? rig.spots.get(focusId) : undefined
    const focus = rig.isOverview ? overview.center : (followed ?? tee)
    const blend = 1 - Math.exp(-camera.follow * delta)
    rig.target.lerp(focus, blend)
    const distance = rig.isOverview ? overview.reach * camera.overviewReach : rig.distance
    const pitch = rig.isOverview ? camera.overviewPitch : camera.pitch
    view.position.lerp(cameraSpot(rig.target, rig.yaw, distance, pitch, spot.current), blend)
    view.lookAt(rig.target)
  })

  return null
}
