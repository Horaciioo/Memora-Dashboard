'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

import { GRID_BALLS, GRID_UNIFORMS, haloRadius } from '@/composites/play/golf/scene/decor/grid'
import type { GolfRig } from '@/composites/play/golf/scene/camera/rig'
import type { GolfMotion, GolfPlayerState, GolfPoint } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { halo } = GOLF_SCENE.grid

export interface GolfGridGlowProps {
  players: GolfPlayerState[]
  viewerId: string
  motionRef: RefObject<GolfMotion>
  rigRef: RefObject<GolfRig>
  // Played hole spot on its map
  origin: GolfPoint
  isStill: boolean
}

/**
 * Feeds resting balls to the ground grid, cells light up round them
 * @param {GolfGridGlowProps} props - Balls and rig
 * @return {null}
 */

export const GolfGridGlow = ({
  players,
  viewerId,
  motionRef,
  rigRef,
  origin,
  isStill,
}: GolfGridGlowProps) => {
  // Eased growth per player
  const growth = useRef(new Map<string, number>())

  useEffect(() => {
    GRID_UNIFORMS.uGridOrigin.value.set(origin[0], origin[1])
  }, [origin])
  // Nothing left lit once the scene goes
  useEffect(
    () => () => {
      for (const slot of GRID_UNIFORMS.uBalls.value) slot.set(0, 0, 0, 0)
    },
    []
  )

  useFrame(({ clock }, delta) => {
    GRID_UNIFORMS.uHaloRadius.value = isStill ? halo.radius : haloRadius(clock.elapsedTime)
    const slots = GRID_UNIFORMS.uBalls.value
    for (let index = 0; index < GRID_BALLS; index += 1) {
      const player = players[index]
      const spot = player ? rigRef.current.spots.get(player.accountId) : undefined
      if (!player || !spot) {
        slots[index].set(0, 0, 0, 0)
        continue
      }
      const isResting =
        !player.isHoled && !player.hasLeft && !motionRef.current.tracks.has(player.accountId)
      const before = growth.current.get(player.accountId) ?? 0
      const seconds = isResting ? halo.lightUp : halo.fadeOut
      const next = before + ((isResting ? 1 : 0) - before) * Math.min(1, delta / seconds)
      growth.current.set(player.accountId, next)
      const strength = player.accountId === viewerId ? halo.mine : halo.other
      slots[index].set(spot.x, spot.z, next < 0.01 ? 0 : next, strength)
    }
  })

  return null
}
