'use client'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'

/**
 * Feed of a game drawn straight from its view, moved with each pushed board
 * @param {Object} props - Feed
 * @param {string} props.sessionId - Game
 * @param {Object} props.board - Board of the page render
 * @param {Record<string, string>} props.copy - Template per kind
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const PlainLiveFeed = ({
  sessionId,
  board: initial,
  copy,
  players,
}: {
  sessionId: string
  board: { serverTime: Date | string; feed: PlayFeedLine[] }
  copy: Record<string, string>
  players: PlayFace[]
}) => {
  const board = usePlainBoard(sessionId, initial)

  return <PlaySessionFeed feed={board.feed} copy={copy} players={players} />
}
