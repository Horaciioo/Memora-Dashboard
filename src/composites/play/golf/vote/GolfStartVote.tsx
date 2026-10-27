'use client'

import { GolfVote } from '@/composites/play/golf/vote/GolfVote'
import type { PlayVoteProps } from '@/composites/play/registry'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { golfSettingsOf, golfVoteOf } from '@/core/lib/play/golf'

/**
 * Format and course vote of a golf lobby, drawn for every player while the host's launch is open
 * @param {PlayVoteProps} props - Lobby and its settings
 * @return {JSX.Element | null}
 */

export const GolfStartVote = ({
  sessionId,
  settings,
  serverTime,
  viewerId,
  hostId,
  faces,
}: PlayVoteProps) => {
  const moves = usePlayMoves()
  const vote = golfVoteOf(settings)
  if (!vote) return null

  return (
    <GolfVote
      vote={vote}
      settings={golfSettingsOf(settings)}
      serverTime={serverTime}
      viewerId={viewerId}
      hostId={hostId}
      faces={faces}
      isSaving={moves.isSaving}
      onSend={(payload) => void moves.vote(sessionId, payload)}
    />
  )
}
