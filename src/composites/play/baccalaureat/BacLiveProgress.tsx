'use client'

import type { BacBoardView } from '@/composites/play/baccalaureat/types'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { BacSessionProgress } from '@/composites/play/session/BacSessionProgress'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'

/**
 * Round progress, hidden on the final ranking, moved with each pushed board
 * @param {Object} props - Progress
 * @param {string} props.sessionId - Game
 * @param {BacBoardView} props.board - Board of the page render
 * @param {PlayFace[]} props.players - Seated
 * @return {JSX.Element | null}
 */

export const BacLiveProgress = ({
  sessionId,
  board: initial,
  players,
}: {
  sessionId: string
  board: BacBoardView
  players: PlayFace[]
}) => {
  const board = usePlainBoard(sessionId, initial)

  return board.recap ? null : <BacSessionProgress players={players} done={board.done} />
}
