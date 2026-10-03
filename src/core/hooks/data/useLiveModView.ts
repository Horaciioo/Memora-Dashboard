'use client'

import { useMemo } from 'react'

import type { LiveView } from '@/types/lives'
import type { ModViewDriver, ModViewState } from '@/types/modview'

/**
 * Drive the Mod View of a real live, offline until the platform link exists
 * @param {LiveView} live - Live
 * @return {ModViewDriver} - Driver
 */

export const useLiveModView = (live: LiveView): ModViewDriver => {
  const state = useMemo<ModViewState>(
    () => ({
      platform: live.platform,
      connection: 'disconnected',
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
      modes: {
        shield: false,
        subscribers: false,
        followers: false,
        emotes: false,
        slowSeconds: null,
      },
      community: { broadcaster: [], moderators: [], vips: [], bots: [], viewers: [] },
      liveconLevel: live.liveconLevel?.level ?? null,
    }),
    [live]
  )

  // Gestures stay gated while offline, nothing to carry yet
  return useMemo(() => ({ state, spotlight: null, act: async () => {} }), [state])
}
