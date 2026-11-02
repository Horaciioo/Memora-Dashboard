'use client'

import { useMemo } from 'react'

import { usePresence } from '@/core/hooks/data/realtime'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * Live stands of a game: the page render first, then the room's presence
 * @param {string} sessionId - Game
 * @param {PlayFace[]} players - Seated
 * @param {PlayFace[]} rendered - Spectators of the page render
 * @return {PlayFace[]} - Spectators, by name
 */

export const usePlayCrowd = (
  sessionId: string,
  players: PlayFace[],
  rendered: PlayFace[]
): PlayFace[] => {
  const viewer = useAuthContext().session
  const { members, isReady } = usePresence(PLAY_TOPICS.session(sessionId), null)

  return useMemo(() => {
    if (!isReady) return rendered
    const seated = new Set(players.map((player) => player.id))
    const faces: PlayFace[] = members
      .filter((member) => member.status !== 'left' && !seated.has(member.accountId))
      .map(({ accountId, name, image }) => ({ id: accountId, name, avatarUrl: image }))
    // Presence leaves this tab out
    if (viewer && !seated.has(viewer.id)) {
      faces.push({ id: viewer.id, name: viewer.displayName, avatarUrl: viewer.avatarUrl })
    }

    return faces.toSorted((left, right) => left.name.localeCompare(right.name))
  }, [isReady, members, players, rendered, viewer])
}
