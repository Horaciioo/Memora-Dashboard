import type { OceanStrike } from '@/composites/play/naval/fx/paintStrikes'
import { isHeavy } from '@/composites/play/naval/ocean/paint/damage'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { SeaMarks } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { isHitCode } from '@/core/lib/play/naval/state'

/**
 * Marks with the squares still in flight hidden, until their landing
 * @param {SeaMark[]} marks - Authoritative marks
 * @param {OceanStrike[]} playing - Strikes on screen
 * @param {number} now - Clock
 * @param {number} size - Squares per side
 * @return {SeaMark[]} - Marks shown
 */

export const landedMarks = (
  marks: SeaMark[],
  playing: OceanStrike[],
  now: number,
  size: number
): SeaMark[] => {
  const pending = playing.flatMap(({ strike, startedAt, timeline }) =>
    strike.cells.filter((_, index) => startedAt + (timeline.landings[index] ?? 0) > now)
  )
  if (!pending.length) return marks
  const shown = marks.slice()
  for (const cell of pending) shown[cell.y * size + cell.x] = SeaMarks.Unknown

  return shown
}

/**
 * Clock of the last hit landed on a ship
 * @param {NavalShip} ship - Ship
 * @param {OceanStrike[]} playing - Strikes on screen
 * @param {number} now - Clock
 * @return {number | undefined} - Clock, none when untouched
 */

const lastHitOn = (ship: NavalShip, playing: OceanStrike[], now: number): number | undefined => {
  const squares = new Set(cellsOf(ship).map(({ x, y }) => `${x}:${y}`))
  let last: number | undefined
  for (const { strike, startedAt, timeline } of playing) {
    strike.cells.forEach((cell, index) => {
      const at = startedAt + (timeline.landings[index] ?? 0)
      if (at > now || !isHitCode(cell.code) || !squares.has(`${cell.x}:${cell.y}`)) return
      last = Math.max(last ?? at, at)
    })
  }

  return last
}

/**
 * Ships shoved by the hits just landed
 * @param {OceanShip[]} ships - Ships
 * @param {OceanStrike[]} playing - Strikes on screen
 * @param {number} now - Clock
 * @return {OceanShip[]} - Ships with their jolt
 */

export const withJolts = (ships: OceanShip[], playing: OceanStrike[], now: number): OceanShip[] =>
  playing.length
    ? ships.map((entry) =>
        entry.isWreck ? entry : { ...entry, joltAt: lastHitOn(entry.ship, playing, now) }
      )
    : ships

/**
 * Squares of the heavily hit ships, their smoke turns black
 * @param {OceanShip[]} ships - Ships
 * @param {SeaMark[]} marks - Marks shown
 * @param {number} size - Squares per side
 * @return {Set<number>} - Square indexes
 */

export const heavySquares = (ships: OceanShip[], marks: SeaMark[], size: number): Set<number> => {
  const heavy = new Set<number>()
  for (const { ship, isWreck } of ships) {
    if (isWreck) continue
    const squares = cellsOf(ship).map(({ x, y }) => y * size + x)
    const hits = squares.filter((square) => marks[square] === SeaMarks.Hit)
    if (isHeavy(hits.length / ship.length)) hits.forEach((square) => heavy.add(square))
  }

  return heavy
}
