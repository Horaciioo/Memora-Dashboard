import type { navalView } from '@/core/services/play/naval/NavalViewService'
import type { NavalShip } from '@/core/lib/play/naval/fleet'

// Board as the server sends it, dates as text once read
export type NavalBoardView = Awaited<ReturnType<typeof navalView>>

export type NavalPlayerView = NavalBoardView['players'][number]

export type NavalMatchView = NavalBoardView['matches'][number]

/**
 * Shot of the board, read from its tuple
 * @typedef {Object} NavalShotView
 */

export interface NavalShotView {
  rev: number
  match: number
  shooter: number
  target: number
  x: number
  y: number
  code: NavalShotCode
  weapon: number
  orientation: number
}

// Miss, hit, sunk, then the two flare marks
export type NavalShotCode = 0 | 1 | 2 | 3 | 4

/**
 * Wire codes of a result
 * @type {Record<string, NavalShotCode>}
 */

export const NavalCodes = { Miss: 0, Hit: 1, Sunk: 2, Spotted: 3, Clear: 4 } as const

/**
 * Code that struck a ship
 * @param {number} code - Result code
 * @return {boolean} - Hit or sunk
 */

export const isHitCode = (code: number): boolean =>
  code === NavalCodes.Hit || code === NavalCodes.Sunk

/**
 * Code that came from a flare
 * @param {number} code - Result code
 * @return {boolean} - Lit only
 */

export const isFlareCode = (code: number): boolean =>
  code === NavalCodes.Spotted || code === NavalCodes.Clear

/**
 * Board held by a screen, times in milliseconds
 * @typedef {Object} NavalBoardState
 */

export interface NavalBoardState extends Omit<
  NavalBoardView,
  'startsAt' | 'phaseEndsAt' | 'serverTime' | 'matches'
> {
  startsAt: number
  phaseEndsAt: number
  serverTime: number
  matches: Array<
    Omit<NavalMatchView, 'startsAt' | 'turnEndsAt' | 'readyAt'> & {
      startsAt: number
      turnEndsAt: number
      readyAt: number
    }
  >
}

/**
 * Board read, times as numbers
 * @param {NavalBoardView} board - Board read
 * @return {NavalBoardState} - Held board
 */

export const toNavalState = (board: NavalBoardView): NavalBoardState => ({
  ...board,
  startsAt: new Date(board.startsAt).getTime(),
  phaseEndsAt: new Date(board.phaseEndsAt).getTime(),
  serverTime: new Date(board.serverTime).getTime(),
  matches: board.matches.map((match) => ({
    ...match,
    startsAt: new Date(match.startsAt).getTime(),
    turnEndsAt: new Date(match.turnEndsAt).getTime(),
    readyAt: new Date(match.readyAt).getTime(),
  })),
})

/**
 * Board newer than another
 * @param {NavalBoardState} next - Candidate
 * @param {NavalBoardState | undefined} current - Held
 * @return {boolean} - Newer
 */

export const isNewerNaval = (
  next: NavalBoardState,
  current: NavalBoardState | undefined
): boolean =>
  !current ||
  next.rev > current.rev ||
  (next.rev === current.rev && next.serverTime > current.serverTime)

/**
 * Shots as objects
 * @param {NavalBoardView['shots']} shots - Tuples
 * @return {NavalShotView[]} - Shots
 */

export const shotViewsOf = (shots: NavalBoardView['shots']): NavalShotView[] =>
  shots.map(([rev, match, shooter, target, x, y, code, weapon, orientation]) => ({
    rev,
    match,
    shooter,
    target,
    x,
    y,
    code: code as NavalShotCode,
    weapon,
    orientation,
  }))

/**
 * Squares fired at one captain in one match
 * @param {Pick<NavalBoardView, 'shots'>} board - Board
 * @param {number} match - Match
 * @param {number} target - Captain fired at
 * @return {Array<[number, number, number]>} - Column, row and result code
 */

export const shotsToward = (
  board: Pick<NavalBoardView, 'shots'>,
  match: number,
  target: number
): Array<[number, number, number]> =>
  board.shots
    .filter((shot) => shot[1] === match && shot[3] === target)
    .map((shot) => [shot[4], shot[5], shot[6]])

/**
 * Ships sunk in one sea of one match
 * @param {Pick<NavalBoardView, 'sunk'>} board - Board
 * @param {number} match - Match
 * @param {number} target - Captain
 * @return {NavalShip[]} - Ships sunk
 */

export const sunkToward = (
  board: Pick<NavalBoardView, 'sunk'>,
  match: number,
  target: number
): NavalShip[] =>
  board.sunk.filter((entry) => entry.match === match && entry.target === target).map((e) => e.ship)

/**
 * Strike of one turn: every square it touched
 * @typedef {Object} NavalStrikeView
 */

export interface NavalStrikeView {
  rev: number
  match: number
  shooter: number
  target: number
  weapon: number
  orientation: number
  cells: NavalShotView[]
}

/**
 * Shots gathered by strike, one revision each
 * @param {NavalShotView[]} shots - Shots in order
 * @return {NavalStrikeView[]} - Strikes in order
 */

export const strikesOf = (shots: NavalShotView[]): NavalStrikeView[] => {
  const strikes: NavalStrikeView[] = []
  for (const shot of shots) {
    const last = strikes.at(-1)
    if (last?.rev === shot.rev) {
      last.cells.push(shot)
      continue
    }
    const { rev, match, shooter, target, weapon, orientation } = shot
    strikes.push({ rev, match, shooter, target, weapon, orientation, cells: [shot] })
  }

  return strikes
}

/**
 * Strike that sank a ship
 * @param {NavalStrikeView} strike - Strike
 * @return {boolean} - A ship went down
 */

export const isSinking = (strike: NavalStrikeView): boolean =>
  strike.cells.some((cell) => cell.code === NavalCodes.Sunk)

/**
 * Strike that struck a ship
 * @param {NavalStrikeView} strike - Strike
 * @return {boolean} - Hit or sunk
 */

export const isStriking = (strike: NavalStrikeView): boolean =>
  strike.cells.some((cell) => isHitCode(cell.code))
