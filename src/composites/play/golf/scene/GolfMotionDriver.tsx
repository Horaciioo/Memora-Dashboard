'use client'

import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

import { playBoostSweep, playGolfSound } from '@/composites/play/golf/sound'
import { CUP_PULSE, dueEvents, isLocalTrack, isTrackOver } from '@/core/lib/play/golf'
import type {
  GolfMotion,
  GolfMotionTrack,
  GolfPlayerState,
  GolfShotEvent,
} from '@/core/lib/play/golf'
import { useGolfCheerStore } from '@/core/store/golfCheer'
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
 * Confetti for any ball holed, the banner for the own one
 * @param {GolfMotion} motion - Motion
 * @param {Object} context - Event
 * @param {GolfShotEvent} context.event - Cup event
 * @param {GolfMotionTrack} context.track - Track playing it
 * @param {GolfPlayerState[]} context.players - Board balls
 * @param {string} context.viewerId - Screen owner
 * @param {number} now - Local ms
 * @return {void}
 */

const cheer = (
  motion: GolfMotion,
  {
    event,
    track,
    players,
    viewerId,
  }: { event: GolfShotEvent; track: GolfMotionTrack; players: GolfPlayerState[]; viewerId: string },
  now: number
): void => {
  motion.pulses.set(CUP_PULSE, now)
  const me = players.find((player) => player.accountId === viewerId)
  if (event.id !== viewerId || !me) return
  // Prediction runs before the board counts it
  useGolfCheerStore.getState().cheerHole(me.strokes + (isLocalTrack(track) ? 1 : 0))
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
          if (event.kind === 'cup') cheer(motion, { event, track, players, viewerId }, now)
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
