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

// A line read once, kept even when the thing it tells is gone
interface Told {
  kind: string
  actor: number
  victim: number
  // An attack still going
  isOpen?: boolean
  at: Date
}

// Journal kinds with a line, announce is split by what it announces
const lineKindOf = (kind: string, actor: number, victim: number): string => {
  if (kind === 'landed' && victim === 0) return 'landedFree'
  if (kind === 'announce') return actor === 5 ? 'warning' : 'worldAnnounce'

  return kind
}

/**
 * Concordat feed, a line per event the chat can tell, attacks included, offers go to the popup
 * @param {ConcordatFeedProps} props - Game and faces
 * @return {JSX.Element | null}
 */

export const ConcordatFeed = ({ sessionId, board, players }: ConcordatFeedProps) => {
  const { client } = useConcordatGame(sessionId, board)
  // Lines in the order they were first read
  const [told, setTold] = useState<Record<string, Told>>({})
  if (!client) return null

  const accountOf = (id: number) => client.players[id - 1]?.accountId ?? null
  const nameOf = (id: number) => client.players[id - 1]?.name ?? ''
  const now = new Date()

  const seen: Record<string, Omit<Told, 'at'>> = {}
  client.log.forEach((event, index) => {
    const kind = lineKindOf(event.kind, event.actor, event.victim)
    if (kind in CONCORDAT_FEED_COPY) {
      const isWorld = kind === 'worldAnnounce' || kind === 'worldEnd'
      seen[`${index}:${event.kind}`] = {
        kind,
        actor: isWorld ? 0 : event.actor,
        victim: kind === 'warning' ? event.victim : isWorld ? 0 : event.victim,
      }
    }
  })
  // An attack tells once, again when it comes back after a stop
  const attackers = new Set(
    client.me ? client.corps.filter((row) => row.target === client.me).map((row) => row.owner) : []
  )
  const open = Object.entries(told).filter(([, line]) => line.isOpen)
  for (const owner of attackers) {
    if (!open.some(([, line]) => line.actor === owner)) {
      seen[`threat:${owner}:${Object.keys(told).length}`] = {
        kind: 'threat',
        actor: owner,
        victim: client.me,
        isOpen: true,
      }
    }
  }

  const fresh = Object.keys(seen).filter((id) => !told[id])
  const ended = open.filter(([, line]) => !attackers.has(line.actor))
  if (fresh.length || ended.length) {
    setTold({
      ...told,
      ...Object.fromEntries(ended.map(([id, line]) => [id, { ...line, isOpen: false }])),
      ...Object.fromEntries(fresh.map((id) => [id, { ...seen[id], at: now }])),
    })
  }

  const feed: PlayFeedLine[] = Object.entries(told)
    .map(([id, line]) => ({
      id,
      kind: line.kind,
      isTimeless: true,
      accountId: accountOf(line.actor),
      at: line.at,
      values: {
        victimId: accountOf(line.victim) ?? '',
        victim: nameOf(line.victim),
        ...(accountOf(line.actor) || !line.actor ? {} : { actor: nameOf(line.actor) }),
      },
    }))
    .toReversed()

  return <PlaySessionFeed feed={feed} copy={CONCORDAT_FEED_COPY} players={players} />
}
