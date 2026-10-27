'use client'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import { useLudoBoard } from '@/core/hooks/data/play/useLudoBoard'
import type { LudoBoardView } from '@/core/lib/play/ludo/state'
import { LUDO_FEED_COPY } from '@/declarations/play'

/**
 * Ludo feed, moved with each pushed board
 * @param {Object} props - Feed
 * @param {string} props.sessionId - Game
 * @param {LudoBoardView} props.board - Board of the page render
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const LudoFeed = ({
  sessionId,
  board: initial,
  players,
}: {
  sessionId: string
  board: LudoBoardView
  players: PlayFace[]
}) => {
  const board = useLudoBoard(sessionId, initial)

  return <PlaySessionFeed feed={board.feed} copy={LUDO_FEED_COPY} players={players} />
}
