'use client'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import { useGolfBoard } from '@/core/hooks/data/play/useGolfBoard'
import { useServerAlarm } from '@/core/hooks/interaction/state/useServerAlarm'
import type { GolfBoardView } from '@/core/lib/play/golf'
import { GOLF_FEED_COPY } from '@/declarations/play/golf/copy'

/**
 * Golf feed, live with the board, a hole told once the ball drops
 * @param {Object} props - Feed
 * @param {string} props.sessionId - Game
 * @param {GolfBoardView} props.board - Board of the page render
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const GolfFeed = ({
  sessionId,
  board: initial,
  players,
}: {
  sessionId: string
  board: GolfBoardView
  players: PlayFace[]
}) => {
  const board = useGolfBoard(sessionId, initial)
  // Read again when the next line lands
  const now = useServerAlarm(
    board.feed.map((line) => new Date(line.at).getTime()),
    board.serverTime - board.receivedAt,
    board.receivedAt
  )
  const shown = board.feed.filter((line) => new Date(line.at).getTime() <= now)

  return <PlaySessionFeed feed={shown} copy={GOLF_FEED_COPY} players={players} />
}
