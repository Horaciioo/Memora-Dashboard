import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { StopGoMoveKinds } from '@/utils/constants/play'

/**
 * Moment of a race worth an animation and a sound
 * @typedef {Object} StopGoFx
 */

export interface StopGoFx {
  // Key of STOPGO_FX
  type: string
  // Player acting, or the one it happens to
  accountId: string
  targetIds: string[]
  card: StopGoCardKey | null
  // Hazard posed or lifted
  hazard: string | null
  // Same read as the attack that threw it
  isThrown: boolean
}

/**
 * What the last read left behind
 * @typedef {Object} StopGoFxSnapshot
 */

export interface StopGoFxSnapshot {
  rev: number
  hazards: Record<string, string[]>
}

/**
 * Part of a board the animations read
 * @typedef {Object} StopGoFxBoard
 */

export interface StopGoFxBoard {
  rev: number
  players: { accountId: string; hazards: string[] }[]
  log: {
    rev: number
    kind: string
    accountId: string
    targetIds: string[]
    card: StopGoCardKey | null
  }[]
}

// Log kind to moment
const MOMENTS: Record<string, string> = {
  [StopGoMoveKinds.Distance]: 'drive',
  [StopGoMoveKinds.Green]: 'start',
  [StopGoMoveKinds.Attack]: 'attack',
  [StopGoMoveKinds.Remedy]: 'remedy',
  [StopGoMoveKinds.Immunity]: 'shield',
  [StopGoMoveKinds.Cleanup]: 'sweep',
  [StopGoMoveKinds.GoodDraw]: 'draw',
  [StopGoMoveKinds.Mystery]: 'mystery',
  [StopGoMoveKinds.Reveal]: 'reveal',
  [StopGoMoveKinds.Discard]: 'discard',
  [StopGoMoveKinds.Timeout]: 'discard',
  [StopGoMoveKinds.Shuffle]: 'shuffle',
  [StopGoMoveKinds.Finish]: 'finish',
}

/**
 * Snapshot of a board
 * @param {StopGoFxBoard} board - Board
 * @return {StopGoFxSnapshot} - Snapshot
 */

export const snapshotOf = (board: StopGoFxBoard): StopGoFxSnapshot => ({
  rev: Math.max(board.rev, ...board.log.map((line) => line.rev)),
  hazards: Object.fromEntries(board.players.map((player) => [player.accountId, player.hazards])),
})

/**
 * Moments between a snapshot and a newer board, nothing for a board already seen or the first one
 * @param {StopGoFxSnapshot | null} previous - Snapshot held
 * @param {StopGoFxBoard} board - Board read
 * @return {StopGoFx[]} - Moments in the order they happened
 */

export const fxBetween = (previous: StopGoFxSnapshot | null, board: StopGoFxBoard): StopGoFx[] => {
  if (!previous) return []
  const lines = board.log
    .filter((line) => line.rev > previous.rev && MOMENTS[line.kind])
    .toSorted((left, right) => left.rev - right.rev)
  const moments: StopGoFx[] = lines.map((line) => ({
    type: MOMENTS[line.kind],
    accountId: line.accountId,
    targetIds: line.targetIds,
    card: line.card,
    hazard: null,
    isThrown: false,
  }))
  const isThrown = moments.some((moment) => moment.type === 'attack')

  for (const player of board.players) {
    const before = previous.hazards[player.accountId] ?? []
    const base = { accountId: player.accountId, targetIds: [], card: null, isThrown }
    for (const hazard of player.hazards.filter((entry) => !before.includes(entry))) {
      moments.push({ ...base, type: 'hit', hazard })
    }
    for (const hazard of before.filter((entry) => !player.hazards.includes(entry))) {
      moments.push({ ...base, type: 'heal', hazard, isThrown: false })
    }
  }

  return moments
}
