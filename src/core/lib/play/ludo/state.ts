import type { ludoView } from '@/core/services/play/ludo/LudoViewService'

// Board as the server sends it, dates as text once read
export type LudoBoardView = Awaited<ReturnType<typeof ludoView>>

export type LudoLineView = LudoBoardView['lines'][number]

export type LudoPlayerView = LudoBoardView['players'][number]

/**
 * Board held by a screen, times in milliseconds
 * @typedef {Object} LudoBoardState
 */

export interface LudoBoardState extends Omit<
  LudoBoardView,
  'startsAt' | 'turnEndsAt' | 'serverTime'
> {
  startsAt: number
  turnEndsAt: number
  serverTime: number
}

/**
 * Board read, times as numbers
 * @param {LudoBoardView} board - Board read
 * @return {LudoBoardState} - Held board
 */

export const toLudoState = (board: LudoBoardView): LudoBoardState => ({
  ...board,
  startsAt: new Date(board.startsAt).getTime(),
  turnEndsAt: new Date(board.turnEndsAt).getTime(),
  serverTime: new Date(board.serverTime).getTime(),
})

/**
 * Board newer than another
 * @param {LudoBoardState} next - Candidate
 * @param {LudoBoardState | undefined} current - Held
 * @return {boolean} - Newer
 */

export const isNewerLudo = (next: LudoBoardState, current: LudoBoardState | undefined): boolean =>
  !current ||
  next.rev > current.rev ||
  (next.rev === current.rev && next.serverTime > current.serverTime)

/**
 * Lines a screen has not played yet, oldest first
 * @param {LudoLineView[]} lines - Lines, newest first
 * @param {number} shownRev - Last revision played
 * @return {LudoLineView[] | null} - Lines, null when some are missing
 */

export const linesSince = (lines: LudoLineView[], shownRev: number): LudoLineView[] | null => {
  const fresh = lines.filter((line) => line.rev > shownRev).toReversed()
  if (!fresh.length) return []

  // A gap means the screen slept, it jumps to the board
  return fresh[0].rev === shownRev + 1 ? fresh : null
}

/**
 * Pawns of each colour, by player
 * @param {LudoPlayerView[]} players - Colours
 * @return {Record<string, number[]>} - Steps
 */

export const pawnsOf = (players: LudoPlayerView[]): Record<string, number[]> =>
  Object.fromEntries(players.map((player) => [player.accountId, [...player.pawns]]))
