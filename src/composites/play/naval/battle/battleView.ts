import type { NavalPlayback } from '@/composites/play/naval/fx/useNavalDirector'
import type { OceanStrike } from '@/composites/play/naval/fx/paintStrikes'
import type { OceanShip as SeaShip } from '@/composites/play/naval/ocean/paint/ships'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import { marksOf, shipsDown } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { NavalCodes, sunkToward } from '@/core/lib/play/naval/state'
import type { NavalBoardState, NavalShotView } from '@/core/lib/play/naval/state'
import { NavalPhases } from '@/utils/constants/play'

/**
 * Marks of one sea in one match, from the shots shown
 * @param {NavalBoardState} board - Board
 * @param {NavalShotView[]} shown - Shots shown
 * @param {number} match - Match
 * @param {number} target - Captain fired at
 * @return {SeaMark[]} - Marks
 */

export const marksToward = (
  board: NavalBoardState,
  shown: NavalShotView[],
  match: number,
  target: number
): SeaMark[] =>
  marksOf(
    board.sea.size,
    shown
      .filter((shot) => shot.match === match && shot.target === target)
      .map((shot): [number, number, number] => [shot.x, shot.y, shot.code])
  )

/**
 * Ships a sea shows: the wrecks once down, every ship when the battle is over
 * @param {NavalBoardState} board - Board
 * @param {SeaMark[]} marks - Marks shown
 * @param {number} match - Match
 * @param {number} target - Captain
 * @return {SeaShip[]} - Ships
 */

export const shipsShown = (
  board: NavalBoardState,
  marks: SeaMark[],
  match: number,
  target: number
): SeaShip[] => {
  const down = shipsDown(sunkToward(board, match, target), marks, board.sea.size)
  if (board.phase !== NavalPhases.Over || !board.fleets) {
    return down.map((ship) => ({ ship, isWreck: true }))
  }
  const downIds = new Set(down.map((ship) => ship.id))

  return board.fleets[target].map((ship) => ({ ship, isWreck: downIds.has(ship.id) }))
}

/**
 * Ships afloat in a sea
 * @param {NavalBoardState} board - Board
 * @param {SeaMark[]} marks - Marks shown
 * @param {number} match - Match
 * @param {number} target - Captain
 * @return {number} - Ships afloat
 */

export const afloatToward = (
  board: NavalBoardState,
  marks: SeaMark[],
  match: number,
  target: number
): number =>
  board.sea.fleet.length - shipsDown(sunkToward(board, match, target), marks, board.sea.size).length

/**
 * Match on screen: the one picked, the viewer's own, or a live one
 * @param {NavalBoardState} board - Board
 * @param {number | null} picked - Match picked by the viewer
 * @return {number} - Match index, minus one when none
 */

export const watchedMatch = (board: NavalBoardState, picked: number | null): number => {
  if (picked !== null && board.matches[picked]) return picked
  const mine = board.matches[board.myMatch]
  if (mine && (mine.status === 'LIVE' || board.phase === NavalPhases.Over)) return board.myMatch
  const live = board.matches.findIndex((match) => match.status === 'LIVE')

  return live >= 0 ? live : mine ? board.myMatch : board.matches.length - 1
}

/**
 * Clock a wreck starts down, from the strike sinking it
 * @param {SeaShip} entry - Ship
 * @param {OceanStrike[]} playing - Strikes on this sea
 * @return {SeaShip} - Ship with its clock
 */

const withSinkClock = (entry: SeaShip, playing: OceanStrike[]): SeaShip => {
  if (!entry.isWreck) return entry
  const squares = new Set(cellsOf(entry.ship).map(({ x, y }) => `${x}:${y}`))
  for (const { strike, startedAt, timeline } of playing) {
    const index = strike.cells.findIndex(
      (cell) => cell.code === NavalCodes.Sunk && squares.has(`${cell.x}:${cell.y}`)
    )
    if (index >= 0) return { ...entry, sinkFrom: startedAt + (timeline.landings[index] ?? 0) }
  }

  return entry
}

/**
 * What one sea shows: marks in flight included, ships, strikes on it
 * @param {Object} input - Sea
 * @param {NavalBoardState} input.board - Board
 * @param {NavalPlayback} input.playback - Playback
 * @param {number} input.match - Match
 * @param {number} input.seat - Captain fired at
 * @param {boolean} input.isMine - The viewer's own fleet
 * @return {{ marks: SeaMark[]; ships: SeaShip[]; playing: OceanStrike[] }} - Sea
 */

export const seaShown = ({
  board,
  playback,
  match,
  seat,
  isMine,
}: {
  board: NavalBoardState
  playback: NavalPlayback
  match: number
  seat: number
  isMine: boolean
}) => {
  const marks = marksToward(board, playback.drawn, match, seat)
  const playing = playback.playing.filter(
    ({ strike }) => strike.match === match && strike.target === seat
  )
  const down = shipsShown(board, marks, match, seat)
  const ships: SeaShip[] = isMine
    ? (board.you?.fleet ?? []).map((ship) => ({
        ship,
        isKnown: true,
        isWreck: down.some((entry) => entry.isWreck && entry.ship.id === ship.id),
      }))
    : down

  return { marks, ships: ships.map((entry) => withSinkClock(entry, playing)), playing }
}
