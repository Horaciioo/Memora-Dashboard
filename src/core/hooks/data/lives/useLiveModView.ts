'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useLiveFeed } from '@/core/hooks/data/lives/useLiveFeed'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { blankModView } from '@/core/lib/modview/feed'
import { TWITCH_ENDPOINTS } from '@/declarations/platforms/twitch'
import type { LiveView } from '@/types/lives'
import type { ActContext, ModViewDriver, ModViewIntent, ModViewState } from '@/types/modview'

/**
 * Empty Mod View shown until the snapshot lands
 * @param {LiveView} live - Live
 * @return {ModViewState} - State
 */

const waitingState = (live: LiveView): ModViewState =>
  blankModView({
    platform: live.platform,
    name: live.youtuber.name,
    avatar: live.youtuber.avatar,
    title: live.title,
    liveconLevel: live.liveconLevel?.level ?? null,
  })

/**
 * Official Twitch player of a channel
 * @param {string} login - Channel login
 * @return {string} - Player URL
 */

const playerUrl = (login: string): string => {
  const url = new URL(TWITCH_ENDPOINTS.player)
  url.search = new URLSearchParams({
    channel: login,
    parent: window.location.hostname,
    muted: 'true',
  }).toString()

  return url.toString()
}

/**
 * Drive the Mod View of a real live: snapshot first, then the live feed, gestures sent with the
 * member's own Twitch account
 * @param {LiveView} live - Live
 * @return {ModViewDriver} - Driver
 */

export const useLiveModView = (live: LiveView): ModViewDriver => {
  const [state, setState] = useState<ModViewState>(() => waitingState(live))
  const { run } = useMutation()

  // Snapshot then batches
  const shape = useCallback(
    (snapshot: { state: ModViewState; channelLogin: string | null }) => ({
      ...snapshot.state,
      embedUrl: snapshot.channelLogin ? playerUrl(snapshot.channelLogin) : null,
    }),
    []
  )
  useLiveFeed(live.id, setState, shape)

  // Gestures still on their way, a second click on the same one is dropped
  const inFlight = useRef(new Set<string>())
  const act = useCallback(
    async (intent: ModViewIntent, context?: ActContext) => {
      const signature = JSON.stringify(intent)
      // Already on its way, not refused
      if (inFlight.current.has(signature)) return true

      inFlight.current.add(signature)
      try {
        const done = await run(() =>
          apiPost(API_ROUTES.liveModView(live.id), { intent, context, key: crypto.randomUUID() })
        )

        return done !== null
      } finally {
        inFlight.current.delete(signature)
      }
    },
    [live.id, run]
  )

  return useMemo(() => ({ state, spotlight: null, act }), [state, act])
}
