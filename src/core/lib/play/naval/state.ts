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
  code: 0 | 1 | 2
}

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
  shots.map(([rev, match, shooter, target, x, y, code]) => ({
    rev,
    match,
    shooter,
    target,
    x,
    y,
    code: code as 0 | 1 | 2,
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
