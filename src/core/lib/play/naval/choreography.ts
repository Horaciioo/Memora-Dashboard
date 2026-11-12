import { seededRng } from '@/core/lib/play/seeded'
import type { NavalActorName, NavalImpactName } from '@/utils/constants/play'

/**
 * Landing rhythm of a strike
 * @typedef {Object} NavalLanding
 * @property {number} at - First landing
 * @property {number} step - Gap between landings
 * @property {number} span - Ceiling of all gaps
 */

export interface NavalLanding {
  at: number
  step: number
  span: number
}

/**
 * One timed actor of a strike
 * @typedef {Object} NavalTrack
 * @property {NavalActorName} actor - Painter
 * @property {boolean} perCell - One run per square
 * @property {number} at - Start, whole strike
 * @property {number} lead - Start before landing, per square
 * @property {number | null} duration - Fixed length
 * @property {number} tail - Runs past the last landing
 * @property {number} lift - Arc height share
 */

export interface NavalTrack {
  actor: NavalActorName
  perCell: boolean
  at: number
  lead: number
  duration: number | null
  tail: number
  lift: number
}

/**
 * Choreography of one weapon
 * @typedef {Object} NavalChoreography
 */

export interface NavalChoreography {
  landing: NavalLanding
  impactMs: number
  impact: NavalImpactName
  tracks: NavalTrack[]
  short: { landing: NavalLanding; tracks: NavalTrack[] }
}

/**
 * Actor run placed on the clock
 * @typedef {Object} NavalSpan
 * @property {number} cell - Square index, minus one for the whole strike
 */

export interface NavalSpan {
  track: NavalTrack
  cell: number
  start: number
  end: number
}

/**
 * Strike laid on the clock
 * @typedef {Object} NavalTimeline
 */

export interface NavalTimeline {
  landings: number[]
  spans: NavalSpan[]
  impactMs: number
  impact: NavalImpactName
  // Last landing plus the impact
  total: number
  // Variant picks shared by every screen
  take: number
  entry: number
  isShort: boolean
}

/**
 * Variety drawn the same on every screen
 * @typedef {Object} NavalVariety
 */

export interface NavalVariety {
  variance: number
  takes: number
  entryJitter: number
}

/**
 * Landing clocks of a strike
 * @param {NavalLanding} landing - Rhythm
 * @param {number} count - Squares
 * @return {number[]} - Milliseconds
 */

export const landingsOf = ({ at, step, span }: NavalLanding, count: number): number[] => {
  const gap = count > 1 ? Math.min(step, span / (count - 1)) : 0

  return Array.from({ length: count }, (_, index) => at + index * gap)
}

/**
 * Spans of the tracks against the landings
 * @param {NavalTrack[]} tracks - Tracks
 * @param {number[]} landings - Landing clocks
 * @return {NavalSpan[]} - Spans
 */

const spansOf = (tracks: NavalTrack[], landings: number[]): NavalSpan[] => {
  const last = landings.at(-1) ?? 0

  return tracks.flatMap((track) => {
    // Per square: from the lead to its landing
    if (track.perCell) {
      return landings.map((landing, cell) => {
        const start = Math.max(0, landing - track.lead)
        const end = track.duration === null ? landing : start + track.duration

        return { track, cell, start, end }
      })
    }
    const end = track.duration === null ? last + track.tail : track.at + track.duration

    return [{ track, cell: -1, start: track.at, end }]
  })
}

/**
 * Strike laid out, seeded by its revision
 * @param {Object} input - Strike
 * @param {NavalChoreography} input.choreography - Weapon choreography
 * @param {number} input.count - Squares struck
 * @param {number} input.rev - Revision, the seed
 * @param {boolean} input.isShort - Impact only
 * @param {NavalVariety} variety - Shared variety
 * @return {NavalTimeline} - Timeline
 */

export const timelineOf = (
  {
    choreography,
    count,
    rev,
    isShort,
  }: { choreography: NavalChoreography; count: number; rev: number; isShort: boolean },
  variety: NavalVariety
): NavalTimeline => {
  const rng = seededRng(`naval-strike-${rev}`)
  const pace = 1 + (rng() * 2 - 1) * variety.variance
  const take = Math.floor(rng() * variety.takes)
  const entry = (rng() * 2 - 1) * variety.entryJitter
  const source = isShort ? choreography.short : choreography

  // Every clock stretched by the same pace
  const landings = landingsOf(source.landing, count).map((at) => at * pace)
  const tracks = source.tracks.map((track) => ({
    ...track,
    at: track.at * pace,
    lead: track.lead * pace,
    tail: track.tail * pace,
    duration: track.duration === null ? null : track.duration * pace,
  }))
  const impactMs = choreography.impactMs * pace

  return {
    landings,
    spans: spansOf(tracks, landings),
    impactMs,
    impact: choreography.impact,
    total: (landings.at(-1) ?? 0) + impactMs,
    take,
    entry,
    isShort,
  }
}

/**
 * Longest a full strike may last, for the turn clock
 * @param {NavalChoreography} choreography - Weapon choreography
 * @param {number} count - Squares struck
 * @param {number} variance - Pace variance
 * @return {number} - Milliseconds
 */

export const longestStrikeMs = (
  choreography: NavalChoreography,
  count: number,
  variance: number
): number =>
  ((landingsOf(choreography.landing, count).at(-1) ?? 0) + choreography.impactMs) * (1 + variance)

/**
 * Share of a span run at a clock
 * @param {NavalSpan} span - Span
 * @param {number} age - Strike clock
 * @return {number} - Zero to one, outside when not running
 */

export const progressOf = ({ start, end }: NavalSpan, age: number): number =>
  (age - start) / Math.max(1, end - start)
