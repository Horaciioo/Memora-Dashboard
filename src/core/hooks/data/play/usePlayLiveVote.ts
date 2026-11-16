'use client'

import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import type { Prisma } from '@prisma/client'

import { listenRealtime } from '@/core/lib/realtime/socket'
import { voteOf } from '@/core/lib/play/vote'
import type { PlayVoteState } from '@/core/lib/play/vote'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * Settings whose launch vote follows the picks pushed by the server, without reading the page again
 * @param {string} sessionId - Game
 * @param {Prisma.JsonValue} settings - Settings of the last page read
 * @return {Prisma.JsonValue} - Settings with the freshest vote
 */

export const usePlayLiveVote = (
  sessionId: string,
  settings: Prisma.JsonValue
): Prisma.JsonValue => {
  // A push only counts until the page is read again
  const base = JSON.stringify(voteOf(settings))
  const [live, setLive] = useState<{ base: string; vote: PlayVoteState } | null>(null)
  const keep = useEffectEvent((vote: PlayVoteState) => setLive({ base, vote }))

  useEffect(
    () =>
      listenRealtime(PLAY_TOPICS.session(sessionId), (event, data) => {
        const vote = (data as { vote?: PlayVoteState } | null)?.vote
        if (event === PLAY_STREAM_EVENTS.vote && vote) keep(vote)
      }),
    [sessionId]
  )

  return useMemo(
    () =>
      live && live.base === base
        ? ({ ...(settings as Record<string, unknown>), vote: live.vote } as unknown as Prisma.JsonValue)
        : settings,
    [live, base, settings]
  )
}
