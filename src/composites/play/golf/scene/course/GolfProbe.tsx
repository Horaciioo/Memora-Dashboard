'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Raycaster, Vector2 } from 'three'
import type { Group } from 'three'

import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Seconds between two reads
const EVERY = 0.25
const CENTRE = new Vector2(0, 0)

/**
 * Course spot under the screen centre, in course file units, for admins
 * @param {Object} props - Lawn and callback
 * @param {RefObject<Group | null>} props.lawn - Lawn group
 * @param {(spot: [number, number] | null) => void} props.onProbe - Spot read
 * @return {null}
 */

export const GolfProbe = ({
  lawn,
  onProbe,
}: {
  lawn: RefObject<Group | null>
  onProbe: (spot: [number, number] | null) => void
}) => {
  const raycaster = useMemo(() => new Raycaster(), [])
  const since = useRef(0)

  useFrame(({ camera }, delta) => {
    since.current += delta
    if (since.current < EVERY) return
    since.current = 0
    raycaster.setFromCamera(CENTRE, camera)
    const hit = raycaster.intersectObjects(lawn.current?.children ?? [], true)[0]
    // Course files are written before the layout scale
    const scale = GOLF_SETTINGS.physics.layoutScale
    onProbe(hit ? [hit.point.x / scale, hit.point.z / scale] : null)
  })

  return null
}
