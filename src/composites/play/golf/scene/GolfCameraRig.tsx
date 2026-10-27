'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'

import { cameraSpot, clampDistance, clampPitch, overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import type { GolfHole, GolfPoint } from '@/core/lib/play/golf'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { camera } = GOLF_SETTINGS

/**
 * Camera following a ball, or over the whole hole
 * @param {Object} props - Rig
 * @param {RefObject<GolfRig>} props.rigRef - Shared rig
 * @param {GolfHole} props.hole - Hole
 * @param {string | null} props.focusId - Ball followed
 * @param {string} props.map - Map of the hole
 * @param {GolfPoint} props.origin - Hole spot on its map
 * @return {null}
 */

export const GolfCameraRig = ({
  rigRef,
  hole,
  focusId,
  map,
  origin,
}: {
  rigRef: RefObject<GolfRig>
  hole: GolfHole
  focusId: string | null
  map: string
  origin: GolfPoint
}) => {
  const before = useRef({ map, origin })
  // Map shift still to apply to the view
  const shift = useRef<GolfPoint>([0, 0])

  // Same map: the view keeps its spot and flies to the next hole
  useEffect(() => {
    const last = before.current
    before.current = { map, origin }
    if (last.map !== map) return
    shift.current = [origin[0] - last.origin[0], origin[1] - last.origin[1]]
  }, [map, origin])
  const overview = useMemo(() => overviewOf(hole), [hole])
  const tee = useMemo(() => new Vector3(hole.tee[0], 0, hole.tee[1]), [hole])
  // Share of the overview framing, eased so only the switch glides
  const overviewMix = useRef(0)

  useFrame(({ camera: view }, delta) => {
    const rig = rigRef.current
    const [dx, dz] = shift.current
    if (dx || dz) {
      view.position.x -= dx
      view.position.z -= dz
      rig.target.x -= dx
      rig.target.z -= dz
      shift.current = [0, 0]
    }
    // Held keys turn and zoom
    rig.yaw += rig.turn * camera.turnSpeed * delta
    rig.distance = clampDistance(rig.distance * Math.exp(rig.zoom * camera.keyZoom * delta))
    rig.pitch = clampPitch(rig.pitch + rig.climb * camera.keyPitch * delta)

    const followed = focusId ? rig.spots.get(focusId) : undefined
    const focus = rig.isOverview ? overview.center : (followed ?? tee)
    const blend = 1 - Math.exp(-camera.follow * delta)
    rig.target.lerp(focus, blend)
    overviewMix.current += ((rig.isOverview ? 1 : 0) - overviewMix.current) * blend
    const distance = MathUtils.lerp(
      rig.distance,
      overview.reach * camera.overviewReach,
      overviewMix.current
    )
    const pitch = MathUtils.lerp(rig.pitch, camera.overviewPitch, overviewMix.current)
    // Turns and drags land on the very frame, only the followed point eases
    cameraSpot(rig.target, rig.yaw, distance, pitch, view.position)
    view.lookAt(rig.target)
  })

  return null
}
