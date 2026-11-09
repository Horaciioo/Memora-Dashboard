import type { NavalBoardState, NavalPlayerView } from '@/core/lib/play/naval/state'

/**
 * Seat with its face
 * @typedef {Object} NavalFace
 */

export interface NavalFace {
  accountId: string
  name: string
  avatarUrl: string | null
  isBot: boolean
}

/**
 * Captain at the table, rule data and face together
 * @typedef {Object} NavalCaptainView
 */

export interface NavalCaptainView extends NavalPlayerView, NavalFace {
  index: number
}

/**
 * Captains with their faces, in seat order
 * @param {NavalBoardState} board - Board
 * @param {NavalFace[]} faces - Faces
 * @return {NavalCaptainView[]} - Captains
 */

export const captainsOf = (board: NavalBoardState, faces: NavalFace[]): NavalCaptainView[] =>
  board.players.map((player, index) => {
    const face = faces.find((entry) => entry.accountId === player.accountId)

    return {
      ...player,
      index,
      name: face?.name ?? '',
      avatarUrl: face?.avatarUrl ?? null,
      accountId: player.accountId,
      isBot: face?.isBot ?? false,
    }
  })
