import type { golfView } from '@/core/services/play/golf/GolfViewService'

// Board sent by the engine
export type GolfBoardView = Awaited<ReturnType<typeof golfView>>

// Dates as server ms
type Timed<T, K extends keyof T> = Omit<T, K> & Record<K, number>

/**
 * Board with every moment in server ms
 * @typedef {Object} GolfBoardState
 */

export interface GolfBoardState extends Timed<
  Omit<GolfBoardView, 'players' | 'shots' | 'closedAt' | 'nextAt'>,
  'startsAt' | 'endsAt' | 'serverTime'
> {
  closedAt: number | null
  nextAt: number | null
  players: Timed<GolfBoardView['players'][number], 'restsAt'>[]
  shots: Timed<GolfBoardView['shots'][number], 'at'>[]
  // Local clock when the board arrived
  receivedAt: number
}

export type GolfPlayerState = GolfBoardState['players'][number]

export type GolfShotState = GolfBoardState['shots'][number]

/**
 * Milliseconds of a date
 * @param {Date | string | null} date - Date
 * @return {number | null} - Epoch ms
 */

const msOf = (date: Date | string | null): number | null =>
  date === null ? null : new Date(date).getTime()

/**
 * Board with its dates read
 * @param {GolfBoardView} board - Raw board, dates as dates or text
 * @return {GolfBoardState} - Board
 */

export const toBoardState = (board: GolfBoardView): GolfBoardState => ({
  ...board,
  startsAt: msOf(board.startsAt) ?? 0,
  endsAt: msOf(board.endsAt) ?? 0,
  closedAt: msOf(board.closedAt),
  nextAt: msOf(board.nextAt),
  serverTime: msOf(board.serverTime) ?? 0,
  players: board.players.map((player) => ({ ...player, restsAt: msOf(player.restsAt) ?? 0 })),
  shots: board.shots.map((shot) => ({ ...shot, at: msOf(shot.at) ?? 0 })),
  receivedAt: Date.now(),
})

/**
 * Board newer than another
 * @param {GolfBoardState} next - Candidate
 * @param {GolfBoardState | undefined} current - Board held
 * @return {boolean} - Newer
 */

export const isNewerBoard = (next: GolfBoardState, current: GolfBoardState | undefined): boolean =>
  !current ||
  next.rev > current.rev ||
  (next.rev === current.rev && next.serverTime > current.serverTime)
