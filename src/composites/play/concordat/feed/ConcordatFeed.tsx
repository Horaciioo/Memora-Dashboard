'use client'

import { useState } from 'react'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'
import { useConcordatGame } from '@/core/hooks/data/play/useConcordatGame'
import type { ConcordatBoard } from '@/core/lib/play/concordat'
import { CONCORDAT_FEED_COPY } from '@/declarations/play/concordat/hudCopy'

export interface ConcordatFeedProps {
  sessionId: string
  board: ConcordatBoard | null
  players: PlayFace[]
}

/**
 * Concordat feed, a line per journal event the chat can tell
 * @param {ConcordatFeedProps} props - Game and faces
 * @return {JSX.Element | null}
 */

export const ConcordatFeed = ({ sessionId, board, players }: ConcordatFeedProps) => {
  const { client } = useConcordatGame(sessionId, board)
  // Moment each line was first read
  const [told, setTold] = useState<Record<string, Date>>({})
  if (!client) return null

  const accountOf = (id: number) => client.players[id - 1]?.accountId ?? null
  const lines = client.log
    .map((event, index) => ({ id: `${index}:${event.kind}`, event }))
    .filter(({ event }) => event.kind in CONCORDAT_FEED_COPY)
  const fresh = lines.filter(({ id }) => !told[id])
  if (fresh.length) {
    const now = new Date()
    setTold({ ...told, ...Object.fromEntries(fresh.map(({ id }) => [id, now])) })
  }

  const feed: PlayFeedLine[] = lines
    .map(({ id, event }) => ({
      id,
      kind: event.kind,
      accountId: accountOf(event.actor),
      at: told[id] ?? new Date(),
      values: { victimId: accountOf(event.victim) ?? '' },
    }))
    .toReversed()

  return <PlaySessionFeed feed={feed} copy={CONCORDAT_FEED_COPY} players={players} />
}
