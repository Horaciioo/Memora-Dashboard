import choreographies from '@/configurations/play/naval/choreographies.json'
import type {
  NavalChoreography,
  NavalLanding,
  NavalTrack,
  NavalVariety,
} from '@/core/lib/play/naval/choreography'
import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
  readNumber,
} from '@/declarations/configurations/readers'
import { NavalActors, NavalImpacts, NavalWeapons } from '@/utils/constants/play'
import type { NavalActorName, NavalImpactName, NavalWeaponName } from '@/utils/constants/play'

// Raw nodes
const ROOT = 'play/naval/choreographies'
const weapons = readNode(choreographies.weapons, `${ROOT}.weapons`)
const follow = readNode(choreographies.follow, `${ROOT}.follow`)

/**
 * Milliseconds read from a node
 * @param {unknown} raw - Value
 * @param {string} path - Path
 * @return {number} - Milliseconds
 */

const readMs = (raw: unknown, path: string): number =>
  readInteger(raw, { path, fallback: 0, min: 0, max: 10_000 })

/**
 * Landing rhythm read
 * @param {unknown} raw - Node
 * @param {string} path - Path
 * @return {NavalLanding} - Rhythm
 */

const readLanding = (raw: unknown, path: string): NavalLanding => {
  const node = readNode(raw, path)

  return {
    at: readMs(node.at, `${path}.at`),
    step: readMs(node.step, `${path}.step`),
    span: readMs(node.span, `${path}.span`),
  }
}

/**
 * Track list read
 * @param {unknown} raw - Array
 * @param {string} path - Path
 * @return {NavalTrack[]} - Tracks
 */

const readTracks = (raw: unknown, path: string): NavalTrack[] =>
  (Array.isArray(raw) ? raw : []).map((entry, index) => {
    const at = `${path}.${index}`
    const node = readNode(entry, at)

    return {
      actor: readChoice<NavalActorName>(node.actor, {
        path: `${at}.actor`,
        fallback: NavalActors.Shell,
        allowed: Object.values(NavalActors),
      }),
      perCell: readBoolean(node.perCell ?? false, { path: `${at}.perCell`, fallback: false }),
      at: readMs(node.at ?? 0, `${at}.at`),
      lead: readMs(node.lead ?? 0, `${at}.lead`),
      duration: node.duration === undefined ? null : readMs(node.duration, `${at}.duration`),
      tail: readMs(node.tail ?? 0, `${at}.tail`),
      lift: readNumber(node.lift ?? 0, { path: `${at}.lift`, fallback: 0, min: 0, max: 2 }),
    }
  })

/**
 * Choreography of one weapon
 * @param {NavalWeaponName} name - Weapon
 * @return {NavalChoreography} - Choreography
 */

const readChoreography = (name: NavalWeaponName): NavalChoreography => {
  const path = `${ROOT}.weapons.${name}`
  const node = readNode(weapons[name], path)
  const short = readNode(node.short, `${path}.short`)

  return {
    landing: readLanding(node.landing, `${path}.landing`),
    impactMs: readMs(node.impactMs, `${path}.impactMs`),
    impact: readChoice<NavalImpactName>(node.impact, {
      path: `${path}.impact`,
      fallback: NavalImpacts.Blast,
      allowed: Object.values(NavalImpacts),
    }),
    tracks: readTracks(node.tracks, `${path}.tracks`),
    short: {
      landing: readLanding(short.landing, `${path}.short.landing`),
      tracks: readTracks(short.tracks, `${path}.short.tracks`),
    },
  }
}

/**
 * Strike choreographies by weapon
 * @type {Record<NavalWeaponName, NavalChoreography>}
 */

export const NAVAL_CHOREOGRAPHIES = Object.fromEntries(
  Object.values(NavalWeapons).map((name) => [name, readChoreography(name)])
) as Record<NavalWeaponName, NavalChoreography>

/**
 * Variety, camera follow and queue of the strikes
 * @type {Object}
 */

export const NAVAL_DIRECTION = {
  variety: {
    variance: readNumber(choreographies.variance, {
      path: `${ROOT}.variance`,
      fallback: 0,
      min: 0,
      max: 0.3,
    }),
    takes: readInteger(choreographies.takes, { path: `${ROOT}.takes`, fallback: 1, min: 1 }),
    entryJitter: readNumber(choreographies.entryJitter, {
      path: `${ROOT}.entryJitter`,
      fallback: 0,
      min: 0,
      max: 1,
    }),
  } satisfies NavalVariety,
  // Zoom toward the zone, capped at fifteen percent
  follow: {
    zoom: readNumber(follow.zoom, { path: `${ROOT}.follow.zoom`, fallback: 0, min: 0, max: 0.15 }),
    inMs: readMs(follow.inMs, `${ROOT}.follow.inMs`),
    outMs: readMs(follow.outMs, `${ROOT}.follow.outMs`),
  },
  lanes: readInteger(choreographies.lanes, { path: `${ROOT}.lanes`, fallback: 3, min: 1 }),
  backlog: readInteger(choreographies.backlog, { path: `${ROOT}.backlog`, fallback: 3, min: 1 }),
}

// Particle counts of one burst
export type NavalBurst = Record<'spray' | 'spark' | 'debris' | 'smoke', number>

/**
 * Burst read
 * @param {string} name - Burst key
 * @return {NavalBurst} - Counts
 */

const readBurst = (name: string): NavalBurst => {
  const path = `${ROOT}.bursts.${name}`
  const node = readNode(readNode(choreographies.bursts, `${ROOT}.bursts`)[name], path)
  const count = (key: keyof NavalBurst) =>
    readInteger(node[key], { path: `${path}.${key}`, fallback: 0, min: 0, max: 60 })

  return {
    spray: count('spray'),
    spark: count('spark'),
    debris: count('debris'),
    smoke: count('smoke'),
  }
}

/**
 * Particles thrown by a landing
 * @type {Object}
 */

export const NAVAL_BURSTS = {
  miss: readBurst('miss'),
  hit: readBurst('hit'),
  sunk: readBurst('sunk'),
  // One scale per explosion take
  takeScales: (Array.isArray(choreographies.takeScales) ? choreographies.takeScales : [1]).map(
    (scale, index) =>
      readNumber(scale, { path: `${ROOT}.takeScales.${index}`, fallback: 1, min: 0.1, max: 3 })
  ),
  sinkBubbles: readInteger(choreographies.sinkBubbles, {
    path: `${ROOT}.sinkBubbles`,
    fallback: 0,
    min: 0,
  }),
}
