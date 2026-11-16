import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatAirKind } from '@/utils/constants/concordat'

const { air } = CONCORDAT

/**
 * Fields a flight is worked out from
 * @typedef {Object} AirFlight
 */

export interface AirFlight {
  kind: ConcordatAirKind
  base: number
  tile: number
  launchedAt: number
  until: number
}

/**
 * Point of the sky in tiles, with the way the aircraft faces
 * @typedef {Object} AirPoint
 */

export interface AirPoint {
  x: number
  y: number
  angle: number
  // Circling over the target
  isOrbit: boolean
}

// Tiles of the centre of a tile
const centreOf = (tile: number, width: number): [number, number] => [
  (tile % width) + 0.5,
  Math.floor(tile / width) + 0.5,
]

/**
 * Ticks an aircraft needs to reach its target
 * @param {ConcordatAirKind} kind - Kind
 * @param {number} base - Airbase tile
 * @param {number} tile - Target tile
 * @param {number} width - Map width
 * @return {number} - Ticks
 */

export const legTicks = (
  kind: ConcordatAirKind,
  base: number,
  tile: number,
  width: number
): number => {
  const [bx, by] = centreOf(base, width)
  const [tx, ty] = centreOf(tile, width)
  const speed = air[kind].speed

  return Math.max(1, Math.ceil((Math.hypot(tx - bx, ty - by) / speed) * CONCORDAT_TICKS_PER_SECOND))
}

// Position at a tick, without the heading
const rawPoint = (
  flight: AirFlight,
  tick: number,
  width: number
): { x: number; y: number; isOrbit: boolean } => {
  const [bx, by] = centreOf(flight.base, width)
  const [tx, ty] = centreOf(flight.tile, width)
  const leg = legTicks(flight.kind, flight.base, flight.tile, width)
  const orbit = air[flight.kind].orbit
  const turn = air[flight.kind].speed / orbit / CONCORDAT_TICKS_PER_SECOND
  const stay = Math.max(0, flight.until - flight.launchedAt - 2 * leg)
  const time = Math.min(Math.max(0, tick - flight.launchedAt), flight.until - flight.launchedAt)

  // The circle opens on the side facing the base
  const start = Math.atan2(by - ty, bx - tx)
  const circle = (spent: number): [number, number] => [
    tx + Math.cos(start + turn * spent) * orbit,
    ty + Math.sin(start + turn * spent) * orbit,
  ]
  const [ox, oy] = circle(0)
  const [ex, ey] = circle(stay)

  if (time < leg) {
    const share = time / leg

    return { x: bx + (ox - bx) * share, y: by + (oy - by) * share, isOrbit: false }
  }
  if (time <= leg + stay) {
    const [x, y] = circle(time - leg)

    return { x, y, isOrbit: true }
  }
  const share = Math.min(1, (time - leg - stay) / leg)

  return { x: ex + (bx - ex) * share, y: ey + (by - ey) * share, isOrbit: false }
}

/**
 * Where an aircraft is at a tick, the same on the server and on every screen
 * @param {AirFlight} flight - Flight
 * @param {number} tick - Clock, may be fractional
 * @param {number} width - Map width
 * @return {AirPoint} - Point
 */

export const airPoint = (flight: AirFlight, tick: number, width: number): AirPoint => {
  const now = rawPoint(flight, tick, width)
  const next = rawPoint(flight, tick + 0.5, width)
  const angle = Math.atan2(next.y - now.y, next.x - now.x)

  return { ...now, angle }
}

/**
 * Is the aircraft circling over its target
 * @param {AirFlight} flight - Flight
 * @param {number} tick - Clock
 * @param {number} width - Map width
 * @return {boolean} - Circling
 */

export const isCircling = (flight: AirFlight, tick: number, width: number): boolean =>
  tick >= flight.launchedAt && tick < flight.until && rawPoint(flight, tick, width).isOrbit
