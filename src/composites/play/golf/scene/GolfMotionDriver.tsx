'use client'

import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

import { dueEvents, isTrackOver } from '@/core/lib/play/golf'
import type { GolfMotion, GolfPlayerState, GolfShotEvent } from '@/core/lib/play/golf'
import { playTones } from '@/core/lib/play/sounds'
import { usePlaySoundStore } from '@/core/store/playSound'
import { GOLF_SOUNDS } from '@/declarations/play/golf/sounds'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Quietest contact
const MIN_VOLUME = 0.15

/**
 * Loudness of an event, contacts by their speed
 * @param {GolfShotEvent} event - Event
 * @return {number} - Volume
 */

const volumeOf = (event: GolfShotEvent): number =>
  ['wall', 'ball', 'spinner', 'bumper', 'hit'].includes(event.kind)
    ? Math.min(1, Math.max(MIN_VOLUME, event.strength / (GOLF_SETTINGS.physics.maxSpeed / 2)))
    : 1

/**
 * Sounds and bumper swells of the tracks, finished tracks dropped once the board caught up
 * @param {Object} props - Motion
 * @param {RefObject<GolfMotion>} props.motionRef - Motion
 * @param {GolfPlayerState[]} props.players - Board balls
 * @return {null}
 */

export const GolfMotionDriver = ({
  motionRef,
  players,
}: {
  motionRef: RefObject<GolfMotion>
  players: GolfPlayerState[]
}) => {
  useFrame(() => {
    const motion = motionRef.current
    const now = performance.now()
    const { isMuted } = usePlaySoundStore.getState()
    for (const [id, track] of motion.tracks) {
      // The ball hit carries the sounds
      if (track.isLead) {
        for (const event of dueEvents(track, now)) {
          if (event.kind === 'bumper') motion.pulses.set(event.id, now)
          if (!isMuted) playTones(GOLF_SOUNDS[event.kind], volumeOf(event))
        }
      }
      if (!isTrackOver(track, now)) continue
      // Board still before this stroke
      const player = players.find((entry) => entry.accountId === id)
      if (!player || player.restsAt >= track.serverStart) motion.tracks.delete(id)
    }
  })

  return null
}
