import { recentEvent } from '@/core/lib/play/golf'
import type { GolfEventKind, GolfMotionTrack } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { pop, reappear, vanish, drop } = GOLF_SCENE

// Contact kinds and their gain
const POP_GAINS: Partial<Record<GolfEventKind, number>> = {
  wall: pop.wall,
  ball: pop.hit,
  spinner: pop.wall,
  bumper: pop.bumper,
  hit: pop.hit,
  land: pop.land,
}

// Kinds that make the ball vanish
const VANISH_KINDS: GolfEventKind[] = ['fall']

// Kinds that make it come back
const REAPPEAR_KINDS: GolfEventKind[] = ['portal', 'vortex']

/**
 * Latest contact of a ball, still popping
 * @param {GolfMotionTrack} track - Track
 * @param {string} id - Ball
 * @param {number} now - Local ms
 * @return {ReturnType<typeof recentEvent>} - Event and age
 */

const recentContact = (track: GolfMotionTrack, id: string, now: number) =>
  recentEvent(track, id, Object.keys(POP_GAINS) as GolfEventKind[], now, pop.ms)

/**
 * Size factor from the latest event of a ball
 * @param {GolfMotionTrack | undefined} track - Track
 * @param {string} id - Ball
 * @param {number} now - Local ms
 * @return {number} - Scale factor
 */

export const eventScale = (track: GolfMotionTrack | undefined, id: string, now: number): number => {
  if (!track) return 1

  // Falling out shrinks
  const fallen = recentEvent(track, id, VANISH_KINDS, now, vanish.ms)
  if (fallen) return Math.max(0, 1 - fallen.ageMs / vanish.ms)

  // Teleported grows back
  const moved = recentEvent(track, id, REAPPEAR_KINDS, now, reappear.ms)
  if (moved) return moved.ageMs / reappear.ms

  // Contact pops, then settles
  const hit = recentContact(track, id, now)
  if (!hit) return 1
  const gain = POP_GAINS[hit.event.kind] ?? 0

  return 1 + gain * Math.sin(Math.PI * (hit.ageMs / pop.ms))
}

/**
 * Height above the tee while a ball falls on a new hole, bouncing
 * @param {number} ageMs - Since the hole showed
 * @return {number} - Lift in metres
 */

export const dropLift = (ageMs: number): number => {
  const progress = ageMs / drop.ms
  if (progress >= 1) return 0
  // Three shrinking hops
  const hops = [
    [0, 0.45, 1],
    [0.45, 0.78, 0.3],
    [0.78, 1, 0.1],
  ] as const
  const [from, to, height] = hops.find(([, end]) => progress < end) ?? hops[2]
  const local = (progress - from) / (to - from)

  return from === 0
    ? drop.height * (1 - local * local)
    : drop.height * height * 4 * local * (1 - local)
}
