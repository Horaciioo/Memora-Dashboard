'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMutation } from '@/core/hooks/data/useMutation'
import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { applySceneEvent } from '@/core/lib/modview/scene'
import type { SceneEvent } from '@/core/lib/modview/scene'
import { LIVE_STREAM_EVENTS } from '@/declarations/lives/topics'
import { TWITCH_ENDPOINTS } from '@/declarations/platforms/twitch'
import type { LiveView } from '@/types/lives'
import type {
  ActContext,
  ModViewConnection,
  ModViewDriver,
  ModViewIntent,
  ModViewState,
} from '@/types/modview'

/**
 * Empty Mod View shown until the snapshot lands
 * @param {LiveView} live - Live
 * @return {ModViewState} - State
 */

const waitingState = (live: LiveView): ModViewState => ({
  platform: live.platform,
  connection: 'connecting',
  channel: {
    name: live.youtuber.name,
    avatar: live.youtuber.avatar,
    category: null,
    categoryArt: null,
  },
  title: live.title,
  embedUrl: null,
  messages: [],
  acts: [],
  held: [],
  unbanRequests: [],
  blockedTerms: [],
  allowedTerms: [],
  modes: { shield: false, subscribers: false, followers: false, emotes: false, slowSeconds: null },
  community: { broadcaster: [], moderators: [], vips: [], bots: [], viewers: [] },
  liveconLevel: live.liveconLevel?.level ?? null,
})

/**
 * Official Twitch player of a channel, muted
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

  // Snapshot, read again after each reconnection to catch up
  const load = useCallback(
    () =>
      apiGet<{ state: ModViewState; channelLogin: string | null }>(API_ROUTES.liveModView(live.id))
        .then((snapshot) =>
          setState({
            ...snapshot.state,
            embedUrl: snapshot.channelLogin ? playerUrl(snapshot.channelLogin) : null,
          })
        )
        .catch(() => null),
    [live.id]
  )

  // Live feed of the session
  useEffect(() => {
    void load()
    const source = new EventSource(API_ROUTES.liveFeed(live.id))

    source.addEventListener(LIVE_STREAM_EVENTS.scene, (message) => {
      const { event } = JSON.parse((message as MessageEvent<string>).data) as { event: SceneEvent }
      setState((current) => applySceneEvent({ view: current, spotlight: null }, event).view)
    })
    source.addEventListener(LIVE_STREAM_EVENTS.connection, (message) => {
      const link = JSON.parse((message as MessageEvent<string>).data) as {
        state: ModViewConnection
        notice: string | null
      }
      setState((current) => ({
        ...current,
        connection: link.state,
        // A read-only seat keeps its own reason
        notice: current.readOnly ? current.notice : link.notice,
      }))
    })
    // A reopening after a cut reads the snapshot again to catch up
    let opened = false
    source.addEventListener('open', () => {
      if (opened) void load()
      opened = true
    })

    return () => source.close()
  }, [live.id, load])

  const act = useCallback(
    async (intent: ModViewIntent, context?: ActContext) => {
      await run(() =>
        apiPost(API_ROUTES.liveModView(live.id), { intent, context, key: crypto.randomUUID() })
      )
    },
    [live.id, run]
  )

  return useMemo(() => ({ state, spotlight: null, act }), [state, act])
}
