import { cellsOf, indexOf } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NavalCodes, isHitCode } from '@/core/lib/play/naval/state'

/**
 * What a square shows
 * @type {Record<string, number>}
 */

export const SeaMarks = {
  Unknown: 0,
  Miss: 1,
  Hit: 2,
  Spotted: 3,
} as const

export type SeaMark = (typeof SeaMarks)[keyof typeof SeaMarks]

/**
 * Marks of a sea from the shots fired at it
 * @param {number} size - Squares per side
 * @param {Array<[number, number, number]>} shots - Column, row and result code
 * @return {SeaMark[]} - One mark per square
 */

export const marksOf = (size: number, shots: Array<[number, number, number]>): SeaMark[] => {
  const marks: SeaMark[] = Array.from({ length: size * size }, () => SeaMarks.Unknown)
  for (const [x, y, code] of shots) {
    const at = indexOf(x, y, size)
    if (code === NavalCodes.Spotted) {
      if (marks[at] === SeaMarks.Unknown) marks[at] = SeaMarks.Spotted
      continue
    }
    marks[at] = isHitCode(code) ? SeaMarks.Hit : SeaMarks.Miss
  }

  return marks
}

/**
 * Ships whose every square was hit, ready to show whole
 * @param {NavalShip[]} ships - Candidates
 * @param {SeaMark[]} marks - Marks of the sea
 * @param {number} size - Squares per side
 * @return {NavalShip[]} - Ships down
 */

export const shipsDown = (ships: NavalShip[], marks: SeaMark[], size: number): NavalShip[] =>
  ships.filter((ship) =>
    cellsOf(ship).every(({ x, y }) => marks[indexOf(x, y, size)] === SeaMarks.Hit)
  )

/**
 * Ship covering a square
 * @param {NavalShip[]} fleet - Ships
 * @param {number} x - Column
 * @param {number} y - Row
 * @return {NavalShip | undefined} - Ship
 */

export const shipAt = (fleet: NavalShip[], x: number, y: number): NavalShip | undefined =>
  fleet.find((ship) => cellsOf(ship).some((cell) => cell.x === x && cell.y === y))
