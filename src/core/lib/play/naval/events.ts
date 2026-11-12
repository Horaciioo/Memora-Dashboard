import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { isHitCode, NavalCodes, shotViewsOf, strikesOf } from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView } from '@/core/lib/play/naval/state'
import { NavalPhases } from '@/utils/constants/play'
import type { NavalPhaseName, NavalWeaponName } from '@/utils/constants/play'

/**
 * Thing that happened between two boards, captains and matches by index
 * @typedef {Object} NavalEvent
 */

export type NavalEvent =
  | { kind: 'phase'; phase: NavalPhaseName }
  | { kind: 'turn'; match: number; shooter: number }
  | {
      kind: 'strike'
      rev: number
      match: number
      shooter: number
      target: number
      weapon: NavalWeaponName
      orientation: number
      cells: NavalShotView[]
    }
  | { kind: 'damage'; match: number; target: number; shipId?: number; level: 1 | 2 }
  | { kind: 'sunk'; match: number; target: number; ship: NavalShip }
  | { kind: 'eliminated'; player: number }
  | { kind: 'ended'; winner: number | null }

/**
 * Hit share of heavy damage
 * @type {number}
 */

export const HEAVY_SHARE = 0.5

/**
 * Whether a square belongs to a ship
 * @param {NavalShip} ship - Ship
 * @param {number} x - Column
 * @param {number} y - Row
 * @return {boolean} - Under the hull
 */

const covers = (ship: NavalShip, x: number, y: number): boolean =>
  ship.isHorizontal
    ? y === ship.y && x >= ship.x && x < ship.x + ship.length
    : x === ship.x && y >= ship.y && y < ship.y + ship.length

/**
 * Damage events of one strike, ships named only when the viewer owns them
 * @param {NavalBoardState} next - Newer board
 * @param {number} viewer - Viewer's index, -1 for a spectator
 * @param {Extract<NavalEvent, { kind: 'strike' }>} hit - Strike
 * @return {NavalEvent[]} - Damage events
 */

const damageOf = (
  next: NavalBoardState,
  viewer: number,
  hit: Extract<NavalEvent, { kind: 'strike' }>
): NavalEvent[] => {
  const struck = hit.cells.filter((cell) => cell.code === NavalCodes.Hit)
  if (!struck.length) return []
  const base = { kind: 'damage' as const, match: hit.match, target: hit.target }
  const fleet = hit.target === viewer ? next.you?.fleet : null
  if (!fleet) return [{ ...base, level: 1 }]

  // Only the ships of this strike that are still afloat
  const all = shotViewsOf(next.shots).filter(
    (shot) => shot.match === hit.match && shot.target === hit.target && isHitCode(shot.code)
  )

  return fleet.flatMap((ship) => {
    if (!struck.some((cell) => covers(ship, cell.x, cell.y))) return []
    const count = all.filter((shot) => covers(ship, shot.x, shot.y)).length
    const level: 1 | 2 = count >= ship.length * HEAVY_SHARE ? 2 : 1

    return [{ ...base, shipId: ship.id, level }]
  })
}

/**
 * Events between two authoritative boards, nothing on a first board
 * @param {NavalBoardState | undefined} previous - Board held
 * @param {NavalBoardState} next - Board received
 * @param {number} [viewer] - Viewer's index, -1 for a spectator
 * @return {NavalEvent[]} - Events in playing order
 */

export const eventsBetween = (
  previous: NavalBoardState | undefined,
  next: NavalBoardState,
  viewer = -1
): NavalEvent[] => {
  if (!previous || next.rev <= previous.rev) return []
  const events: NavalEvent[] = []
  if (next.phase !== previous.phase) events.push({ kind: 'phase', phase: next.phase })

  next.matches.forEach((match, index) => {
    const before = previous.matches[index]
    if (match.turn >= 0 && match.turn !== before?.turn) {
      events.push({ kind: 'turn', match: index, shooter: match.turn })
    }
  })

  const seen = new Set(shotViewsOf(previous.shots).map((shot) => shot.rev))
  const fresh = shotViewsOf(next.shots).filter((shot) => !seen.has(shot.rev))
  for (const group of strikesOf(fresh)) {
    const hit = {
      kind: 'strike' as const,
      rev: group.rev,
      match: group.match,
      shooter: group.shooter,
      target: group.target,
      weapon: NAVAL_WEAPONS[group.weapon]?.name ?? NAVAL_WEAPONS[0].name,
      orientation: group.orientation,
      cells: group.cells,
    }
    events.push(hit, ...damageOf(next, viewer, hit))
  }

  const known = new Set(previous.sunk.map((e) => `${e.match}:${e.target}:${e.ship.id}`))
  for (const { match, target, ship } of next.sunk) {
    if (!known.has(`${match}:${target}:${ship.id}`)) {
      events.push({ kind: 'sunk', match, target, ship })
    }
  }

  next.players.forEach((player, index) => {
    if (player.isOut && !previous.players[index]?.isOut) {
      events.push({ kind: 'eliminated', player: index })
    }
  })

  if (next.phase === NavalPhases.Over && previous.phase !== NavalPhases.Over) {
    const last = next.matches.reduce((a, b) => (b.round >= a.round ? b : a), next.matches[0])
    events.push({ kind: 'ended', winner: last && last.winner >= 0 ? last.winner : null })
  }

  return events
}
