import type { GolfShotState } from '@/core/lib/play/golf/board'
import { pathAt } from '@/core/lib/play/golf/frames'
import type { GolfShotEvent, GolfShotResult } from '@/core/lib/play/golf/types'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Key of a track still predicted on this screen
const LOCAL_KEY = 'local'

/**
 * Track one ball is replaying
 * @typedef {Object} GolfMotionTrack
 */

export interface GolfMotionTrack {
  // Shot id, or local while predicted
  key: string
  path: number[]
  frameMs: number
  frames: number
  events: GolfShotEvent[]
  // Local ms of frame zero
  startedAt: number
  // Server ms of the stroke
  serverStart: number
  // Events already heard
  played: number
  // Ball hit, its track carries the sounds
  isLead: boolean
}

/**
 * Every ball in motion on a screen
 * @typedef {Object} GolfMotion
 */

export interface GolfMotion {
  tracks: Map<string, GolfMotionTrack>
  // Shots already handled
  seen: Set<string>
  // Local ms each bumper was last hit
  pulses: Map<string, number>
}

/**
 * Empty motion
 * @return {GolfMotion} - Motion
 */

export const createMotion = (): GolfMotion => ({
  tracks: new Map(),
  seen: new Set(),
  pulses: new Map(),
})

/**
 * Fractional frame of a track
 * @param {GolfMotionTrack} track - Track
 * @param {number} now - Local ms
 * @return {number} - Frame
 */

export const frameOf = (track: GolfMotionTrack, now: number): number =>
  Math.max(0, (now - track.startedAt) / track.frameMs)

/**
 * Track played to its last frame
 * @param {GolfMotionTrack} track - Track
 * @param {number} now - Local ms
 * @return {boolean} - Over
 */

export const isTrackOver = (track: GolfMotionTrack, now: number): boolean =>
  frameOf(track, now) >= track.frames - 1

/**
 * Spot of a ball on its track
 * @param {GolfMotionTrack} track - Track
 * @param {number} now - Local ms
 * @return {{ x: number, z: number }} - Metres
 */

export const trackSpot = (track: GolfMotionTrack, now: number): { x: number; z: number } =>
  pathAt(track.path, frameOf(track, now))

/**
 * Events reached since the last call
 * @param {GolfMotionTrack} track - Track
 * @param {number} now - Local ms
 * @return {GolfShotEvent[]} - New events
 */

export const dueEvents = (track: GolfMotionTrack, now: number): GolfShotEvent[] => {
  const frame = frameOf(track, now)
  const due: GolfShotEvent[] = []
  while (track.played < track.events.length && track.events[track.played].f <= frame) {
    due.push(track.events[track.played])
    track.played += 1
  }

  return due
}

/**
 * Event of a kind already reached by a ball
 * @param {GolfMotionTrack} track - Track
 * @param {string} id - Ball
 * @param {string[]} kinds - Kinds
 * @param {number} now - Local ms
 * @return {GolfShotEvent | undefined} - Event
 */

export const reachedEvent = (
  track: GolfMotionTrack,
  id: string,
  kinds: string[],
  now: number
): GolfShotEvent | undefined => {
  const frame = frameOf(track, now)

  return track.events.find(
    (event) => event.id === id && kinds.includes(event.kind) && event.f <= frame
  )
}

/**
 * Tracks of a stroke for every ball it moved
 * @param {GolfMotion} motion - Motion
 * @param {Pick<GolfShotResult, 'paths' | 'frameMs' | 'frames' | 'events'>} track - Stroke
 * @param {Object} timing - Start and ball hit
 * @return {void}
 */

const startTracks = (
  motion: GolfMotion,
  {
    paths,
    frameMs,
    frames,
    events,
  }: Pick<GolfShotResult, 'paths' | 'frameMs' | 'frames' | 'events'>,
  timing: Pick<GolfMotionTrack, 'key' | 'startedAt' | 'serverStart'> & { leadId: string }
): void => {
  const { leadId, ...start } = timing
  const track = {
    ...start,
    path: [] as number[],
    frameMs,
    frames,
    events,
    played: 0,
    isLead: false,
  }
  // Sounds already behind are skipped
  const frame = frameOf(track, performance.now())
  while (track.played < events.length && events[track.played].f < frame) track.played += 1
  for (const [id, path] of Object.entries(paths)) {
    motion.tracks.set(id, { ...track, path, isLead: id === leadId })
  }
}

/**
 * Play a predicted stroke straight away
 * @param {GolfMotion} motion - Motion
 * @param {GolfShotResult} result - Local stroke
 * @param {number} serverNow - Server ms
 * @param {string} viewerId - Screen owner
 * @return {void}
 */

export const playLocal = (
  motion: GolfMotion,
  result: GolfShotResult,
  serverNow: number,
  viewerId: string
): void =>
  startTracks(motion, result, {
    key: LOCAL_KEY,
    startedAt: performance.now(),
    serverStart: serverNow,
    leadId: viewerId,
  })

/**
 * Drop a prediction the server refused
 * @param {GolfMotion} motion - Motion
 * @return {void}
 */

export const dropLocal = (motion: GolfMotion): void => {
  for (const [id, track] of motion.tracks) if (track.key === LOCAL_KEY) motion.tracks.delete(id)
}

/**
 * Replay the server strokes not seen yet, a prediction swapped for the real tracks
 * @param {GolfMotion} motion - Motion
 * @param {GolfShotState[]} shots - Recent strokes
 * @param {number} serverNow - Server ms
 * @param {string} viewerId - Screen owner
 * @return {void}
 */

export const syncShots = (
  motion: GolfMotion,
  shots: GolfShotState[],
  serverNow: number,
  viewerId: string
): void => {
  const now = performance.now()
  for (const shot of shots) {
    if (motion.seen.has(shot.id)) continue
    motion.seen.add(shot.id)
    const elapsed = serverNow - shot.at
    if (elapsed >= Math.max(0, shot.track.frames - 1) * shot.track.frameMs) continue

    // Own prediction keeps its clock
    const local = shot.accountId === viewerId ? motion.tracks.get(viewerId) : undefined
    const startedAt =
      local?.key === LOCAL_KEY
        ? local.startedAt
        : now - Math.max(0, elapsed - GOLF_SETTINGS.lateShotMs)
    startTracks(motion, shot.track, {
      key: shot.id,
      startedAt,
      serverStart: shot.at,
      leadId: shot.accountId,
    })
  }
}
