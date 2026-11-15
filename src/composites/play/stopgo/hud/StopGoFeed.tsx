'use client'

import { useState } from 'react'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySessionFeed } from '@/composites/play/session/PlaySessionFeed'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'
import { usePlainBoard } from '@/core/hooks/data/play/usePlainBoard'
import type { StopGoBoardView } from '@/core/lib/play/stopgo'
import { STOPGO_CARD_COPY, STOPGO_FEED_COPY } from '@/declarations/play/stopgo/copy'

// Newest line first, the way a chat reads
const NEWEST_FIRST = (left: PlayFeedLine, right: PlayFeedLine) =>
  Number(right.values.rev) - Number(left.values.rev)

/**
 * Stop & Go feed, a line per move of the public log, nothing of a card kept hidden
 * @param {Object} props - Feed
 * @param {string} props.sessionId - Race
 * @param {StopGoBoardView} props.board - Board of the page render
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const StopGoFeed = ({
  sessionId,
  board: initial,
  players,
}: {
  sessionId: string
  board: StopGoBoardView
  players: PlayFace[]
}) => {
  const board = usePlainBoard(sessionId, initial)
  // Moment each line was first read
  const [told, setTold] = useState<Record<string, Date>>({})
  const nameOf = (id: string) => players.find((face) => face.id === id)?.name ?? ''
  const ordered = board.log.toSorted((left, right) => left.rev - right.rev)
  // Same move twice in one read keeps a stable number
  const seen: Record<string, number> = {}
  const lines = ordered
    .filter((line) => line.kind in STOPGO_FEED_COPY)
    .map((line) => {
      const base = `${line.rev}:${line.kind}:${line.accountId}`
      seen[base] = (seen[base] ?? 0) + 1

      return { id: `${base}:${seen[base]}`, line }
    })
  const fresh = lines.filter(({ id }) => !told[id])
  if (fresh.length) {
    const now = new Date(board.serverTime)
    setTold({ ...told, ...Object.fromEntries(fresh.map(({ id }) => [id, now])) })
  }

  const feed: PlayFeedLine[] = lines
    .map(({ id, line }) => ({
      id,
      kind: line.kind,
      accountId: line.accountId,
      at: told[id] ?? board.serverTime,
      values: {
        rev: line.rev,
        km: line.km ?? line.value ?? 0,
        card: line.card ? STOPGO_CARD_COPY[line.card].name : '',
        others: line.targetIds.map(nameOf).join(', '),
      },
    }))
    .toSorted(NEWEST_FIRST)

  return <PlaySessionFeed feed={feed} copy={STOPGO_FEED_COPY} players={players} />
}
