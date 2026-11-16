import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { airPoint } from '@/core/lib/play/concordat/air/path'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import type {
  ConcordatAircraftRow,
  ConcordatStrikeRow,
} from '@/core/lib/play/concordat/wire/systems'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { ConcordatZoneKinds } from '@/utils/constants/concordat'

const { war, strike } = CONCORDAT_ART
const { weapons } = CONCORDAT

export type ConcordatBurstKind = keyof typeof war.bursts

/**
 * Explosion on screen, placed in tiles
 * @typedef {Object} ConcordatBurst
 */

export interface ConcordatBurst {
  x: number
  y: number
  at: number
  kind: ConcordatBurstKind
  // Radius in tiles
  radius: number
  seed: number
}

/**
 * Everything the war shows that the rows alone do not give: bursts, mood and the clock
 * @typedef {Object} ConcordatWarFx
 */

export interface ConcordatWarFx {
  bursts: ConcordatBurst[]
  flashes: { x: number; y: number; at: number }[]
  seen: Set<number>
  strikes: Map<number, ConcordatStrikeRow>
  aircraft: Map<number, ConcordatAircraftRow>
  isReady: boolean
  tension: number
  shake: number
  tickSeen: number
  tickAt: number
  lastNow: number
  land: number
}

const held = new WeakMap<object, ConcordatWarFx>()

/**
 * War state of a map, created on first use and kept for the whole game
 * @param {ConcordatClientState} client - Game
 * @param {number} land - Land tiles of the map
 * @return {ConcordatWarFx} - State
 */

export const warOf = (client: ConcordatClientState, land: number): ConcordatWarFx => {
  let fx = held.get(client.map)
  if (!fx) {
    fx = {
      bursts: [],
      flashes: [],
      seen: new Set(),
      strikes: new Map(),
      aircraft: new Map(),
      isReady: false,
      tension: 0,
      shake: 0,
      tickSeen: client.tick,
      tickAt: 0,
      lastNow: 0,
      land,
    }
    held.set(client.map, fx)
  }

  return fx
}

/**
 * Stable value between zero and one from two numbers
 * @param {number} first - Seed
 * @param {number} second - Seed
 * @return {number} - Value
 */

export const hashOf = (first: number, second: number): number => {
  const mixed = Math.imul(first ^ Math.imul(second + 0x9e3779b9, 2654435761), 2246822519)

  return ((mixed ^ (mixed >>> 15)) >>> 0) / 4294967296
}

/**
 * Tick of this frame, moved on between two diffs so everything glides
 * @param {ConcordatWarFx} fx - State
 * @param {number} now - Clock in milliseconds
 * @return {number} - Tick, fractional
 */

export const visualTick = (fx: ConcordatWarFx, now: number): number =>
  fx.tickSeen + Math.min(2.6, Math.max(0, (now - fx.tickAt) / CONCORDAT.tickMs))

/**
 * Point of a missile on its arc, in tiles
 * @param {ConcordatStrikeRow} row - Strike
 * @param {number} progress - Share of the flight
 * @param {number} width - Map width
 * @return {[number, number]} - Point
 */

export const strikePoint = (
  row: ConcordatStrikeRow,
  progress: number,
  width: number
): [number, number] => {
  const to: [number, number] = [(row.tile % width) + 0.5, Math.floor(row.tile / width) + 0.5]
  const from: [number, number] =
    row.from >= 0 ? [(row.from % width) + 0.5, Math.floor(row.from / width) + 0.5] : to
  const lift = Math.hypot(to[0] - from[0], to[1] - from[1]) * strike.arc

  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress - Math.sin(Math.PI * progress) * lift,
  ]
}

/**
 * Share of a strike flight done at a tick
 * @param {ConcordatStrikeRow} row - Strike
 * @param {number} tick - Clock
 * @return {number} - Share, zero to one
 */

export const strikeProgress = (row: ConcordatStrikeRow, tick: number): number =>
  Math.min(1, Math.max(0, (tick - row.launchedAt) / Math.max(1, row.impactAt - row.launchedAt)))

const burstKindOf = (kind: ConcordatStrikeRow['kind']): ConcordatBurstKind => kind

const addBurst = (
  fx: ConcordatWarFx,
  now: number,
  x: number,
  y: number,
  kind: ConcordatBurstKind,
  radius: number,
  seed: number
): void => {
  fx.bursts.push({ x, y, at: now, kind, radius, seed })
  if (fx.bursts.length > 60) fx.bursts.shift()
}

// A strike ends: an air burst when it was shot down, a blast on the ground otherwise
const endStrike = (
  fx: ConcordatWarFx,
  row: ConcordatStrikeRow,
  now: number,
  width: number
): void => {
  if (fx.seen.has(row.id)) return
  fx.seen.add(row.id)
  if (row.killAt) {
    const [x, y] = strikePoint(row, strikeProgress(row, row.killAt), width)
    addBurst(fx, now, x, y, 'flak', 2, row.id)

    return
  }
  const kind = burstKindOf(row.kind)
  addBurst(
    fx,
    now,
    (row.tile % width) + 0.5,
    Math.floor(row.tile / width) + 0.5,
    kind,
    weapons.radius[row.kind],
    row.id
  )
}

// Share of the map that burns: the clock, the land taken, scars, shots in the air and fallout
const tensionOf = (client: ConcordatClientState, land: number): number => {
  const { mood } = war
  const minutes = Math.max(0, client.tick - client.pickEnd) / (CONCORDAT_TICKS_PER_SECOND * 60)
  const claimed = client.players.reduce((sum, player) => sum + player.tiles, 0) / Math.max(1, land)
  const fallout = client.systems.zones.filter(
    (zone) => zone.kind === ConcordatZoneKinds.Fallout && zone.until > client.tick
  ).length
  const share = (count: number, full: number) => Math.min(1, count / full)

  return Math.min(
    1,
    share(minutes, mood.clock.minutes) * mood.clock.weight +
      Math.min(1, claimed) * mood.claimed +
      share(client.systems.scars.length, mood.scars.count) * mood.scars.weight +
      share(client.systems.strikes.length + client.systems.aircraft.length, mood.live.count) *
        mood.live.weight +
      share(fallout, mood.fallout.count) * mood.fallout.weight
  )
}

/**
 * Follow the rows of the game and turn their changes into bursts, flashes and mood
 * @param {ConcordatWarFx} fx - State
 * @param {ConcordatScene} scene - Frame data
 * @return {boolean} - Something still moves
 */

export const updateWar = (fx: ConcordatWarFx, scene: ConcordatScene): boolean => {
  const { client, now, camera, width, height } = scene
  const mapWidth = client.map.width
  if (client.tick !== fx.tickSeen) {
    fx.tickSeen = client.tick
    fx.tickAt = now
  }
  const vt = visualTick(fx, now)
  scene.tick = vt

  // Strikes: launch flash on appearance, blast on end
  const current = new Map<number, ConcordatStrikeRow>()
  for (const row of client.systems.strikes) {
    current.set(row.id, row)
    if (!fx.strikes.has(row.id) && fx.isReady && row.from >= 0) {
      fx.flashes.push({
        x: (row.from % mapWidth) + 0.5,
        y: Math.floor(row.from / mapWidth) + 0.5,
        at: now,
      })
    }
    const end = row.killAt || row.impactAt
    if (vt >= end) endStrike(fx, row, now, mapWidth)
  }
  for (const [id, row] of fx.strikes) {
    if (!current.has(id) && fx.isReady) endStrike(fx, row, now, mapWidth)
  }
  fx.strikes = current
  if (fx.seen.size > 400) fx.seen.clear()

  // Aircraft: a hit sparks, a fall before landing bursts
  const flying = new Map<number, ConcordatAircraftRow>()
  for (const row of client.systems.aircraft) {
    flying.set(row.id, row)
    const before = fx.aircraft.get(row.id)
    if (before && row.hp < before.hp && fx.isReady) {
      const point = airPoint(row, vt, mapWidth)
      addBurst(fx, now, point.x, point.y, 'flak', 2, row.id * 7 + row.hp)
    }
  }
  for (const [id, row] of fx.aircraft) {
    if (flying.has(id) || !fx.isReady || client.tick >= row.until - 3) continue
    const point = airPoint(row, vt, mapWidth)
    addBurst(fx, now, point.x, point.y, 'wreck', 3, id)
  }
  fx.aircraft = flying
  fx.isReady = true

  // Mood climbs fast and falls slowly
  const dt = Math.min(250, Math.max(0, now - fx.lastNow))
  fx.lastNow = now
  const target = tensionOf(client, fx.land)
  const rate = target > fx.tension ? war.mood.rise : war.mood.fall
  fx.tension += (target - fx.tension) * Math.min(1, dt / rate)

  // Bursts age out, the strongest near one sets the shake
  fx.bursts = fx.bursts.filter((burst) => now - burst.at < war.bursts[burst.kind].ms)
  fx.flashes = fx.flashes.filter((flash) => now - flash.at < war.air.flash.ms)
  fx.shake = 0
  for (const burst of fx.bursts) {
    const age = now - burst.at
    if (age > war.shakeMs) continue
    const x = camera.x + burst.x * camera.scale
    const y = camera.y + burst.y * camera.scale
    if (x < 0 || y < 0 || x > width || y > height) continue
    fx.shake = Math.max(fx.shake, war.bursts[burst.kind].shake * (1 - age / war.shakeMs))
  }

  return (
    fx.bursts.length > 0 ||
    fx.flashes.length > 0 ||
    client.systems.strikes.length > 0 ||
    client.systems.aircraft.length > 0 ||
    fx.tension > war.mood.min ||
    vt - fx.tickSeen < 2.5
  )
}
