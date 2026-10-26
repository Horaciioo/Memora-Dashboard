'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { DirectionalLight } from 'three'

import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { light, sun } = GOLF_SCENE

/**
 * Sun over the hole, its shadows framing the course
 * @param {Object} props - Hole
 * @param {GolfHole} props.hole - Hole
 * @param {boolean} props.hasShadows - Shadows drawn
 * @return {JSX.Element}
 */

export const GolfSun = ({ hole, hasShadows }: { hole: GolfHole; hasShadows: boolean }) => {
  const ray = useRef<DirectionalLight>(null)
  const { center, reach } = useMemo(() => overviewOf(hole), [hole])

  // Shadow box around the course
  useLayoutEffect(() => {
    const current = ray.current
    if (!current) return
    current.target.position.copy(center)
    current.target.updateMatrixWorld()
    const half = reach / 2 + sun.margin
    const box = current.shadow.camera
    box.left = -half
    box.right = half
    box.top = half
    box.bottom = -half
    box.far = sun.offset[1] * 3
    box.updateProjectionMatrix()
  }, [center, reach])

  return (
    <directionalLight
      ref={ray}
      position={[center.x + sun.offset[0], sun.offset[1], center.z + sun.offset[2]]}
      intensity={light.sun}
      castShadow={hasShadows}
      shadow-mapSize={[sun.map, sun.map]}
      shadow-bias={sun.bias}
      shadow-normalBias={sun.normalBias}
    />
  )
}
