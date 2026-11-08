'use client'

import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

import { playBoostSweep, playCupFanfare, playGolfSound } from '@/composites/play/golf/sound'
import { CUP_PULSE, dueEvents, isTrackOver, trackSpot } from '@/core/lib/play/golf'
import type { GolfMotion, GolfPlayerState, GolfShotEvent } from '@/core/lib/play/golf'
import { useGolfCheerStore } from '@/core/store/play/golfCheer'
import { useGolfHandStore } from '@/core/store/play/golfHand'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Quietest contact
const MIN_VOLUME = 0.15

/**
 * Loudness of an event, contacts by their speed
 * @param {GolfShotEvent} event - Event
 * @return {number} - Volume
 */

const volumeOf = (event: GolfShotEvent): number =>
  ['wall', 'ball', 'spinner', 'bumper', 'hit', 'land'].includes(event.kind)
    ? Math.min(1, Math.max(MIN_VOLUME, event.strength / (GOLF_SETTINGS.physics.maxSpeed / 2)))
    : 1

/**
 * Confetti and floating words for any ball holed, the fanfare for the own one
 * @param {GolfMotion} motion - Motion
 * @param {GolfShotEvent} event - Cup event
 * @param {string} viewerId - Screen owner
 * @param {number} now - Local ms
 * @return {void}
 */

const cheer = (motion: GolfMotion, event: GolfShotEvent, viewerId: string, now: number): void => {
  motion.pulses.set(CUP_PULSE, now)
  // The cup is the one under the ball
  const track = motion.tracks.get(event.id)
  const spot = track ? trackSpot(track, now) : null
  motion.cupAt = spot ? { x: spot.x, z: spot.z } : null
  useGolfCheerStore.getState().cheerHole(event.id, spot?.x ?? 0, spot?.z ?? 0)
  if (event.id === viewerId) playCupFanfare()
}

/**
 * Sounds and bumper or boost pulses of the tracks, finished tracks dropped once the board caught up
 * @param {Object} props - Motion
 * @param {RefObject<GolfMotion>} props.motionRef - Motion
 * @param {GolfPlayerState[]} props.players - Board balls
 * @param {string} props.viewerId - Screen owner
 * @return {null}
 */

export const GolfMotionDriver = ({
  motionRef,
  players,
  viewerId,
}: {
  motionRef: RefObject<GolfMotion>
  players: GolfPlayerState[]
  viewerId: string
}) => {
  useFrame(() => {
    const motion = motionRef.current
    const now = performance.now()
    for (const [id, track] of motion.tracks) {
      // The ball hit carries the sounds
      if (track.isLead) {
        for (const event of dueEvents(track, now)) {
          if (event.kind === 'bumper' || event.kind === 'boost') motion.pulses.set(event.id, now)
          if (event.kind === 'cup') cheer(motion, event, viewerId, now)
          if (event.kind === 'splash') {
            const spot = trackSpot(motion.tracks.get(event.id) ?? track, now)
            motion.splash = { ...spot, at: now }
          }
          if (event.kind === 'full' && event.id === viewerId) useGolfHandStore.getState().bump()
          if (event.kind === 'boost') playBoostSweep()
          else playGolfSound(event.kind, volumeOf(event))
        }
      }
      if (!isTrackOver(track, now)) continue
      // Board still before this stroke
      const player = players.find((entry) => entry.accountId === id)
      if (!player || player.restsAt >= track.serverStart) {
        motion.tracks.delete(id)
        // Own shot over, turn back
        if (player && track.isLead && id === viewerId && !player.isDone) playGolfSound('ready')
      }
    }
  })

  return null
}
