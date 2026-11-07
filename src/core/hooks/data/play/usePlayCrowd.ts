'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { usePresence } from '@/core/hooks/data/realtime'
import { isRealtimeOpen, watchRealtime } from '@/core/lib/realtime/socket'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Who stands in a game's room
 * @typedef {Object} PlayCrowd
 * @property {PlayFace[]} spectators - Watching, by name
 * @property {Set<string>} away - Seated without a socket
 * @property {boolean} isLost - This tab lost its socket
 */

export interface PlayCrowd {
  spectators: PlayFace[]
  away: Set<string>
  isLost: boolean
}

// Server rendering never holds a socket
const isClosedOnServer = () => false

/**
 * Live stands of a game: the page render first, then the room's presence
 * @param {string} sessionId - Game
 * @param {PlayFace[]} players - Seated
 * @param {PlayFace[]} rendered - Spectators of the page render
 * @return {PlayCrowd} - Spectators, absent players, link state
 */

export const usePlayCrowd = (
  sessionId: string,
  players: PlayFace[],
  rendered: PlayFace[]
): PlayCrowd => {
  const viewer = useAuthContext().session
  const { members, isReady } = usePresence(PLAY_TOPICS.session(sessionId), null)
  const isOpen = useSyncExternalStore(watchRealtime, isRealtimeOpen, isClosedOnServer)
  const [isSilent, setSilent] = useState(false)
  const [confirmed, setConfirmed] = useState('')

  // Missing seats, bots and this tab aside
  const absentKey = useMemo(() => {
    if (!isReady) return ''
    const online = new Set(
      members.filter((member) => member.status !== 'left').map((member) => member.accountId)
    )

    return players
      .filter((player) => !player.isBot && player.id !== viewer?.id && !online.has(player.id))
      .map((player) => player.id)
      .toSorted()
      .join(',')
  }, [isReady, members, players, viewer])

  // Notice after a short silence
  useEffect(() => {
    if (isOpen) return
    const timer = window.setTimeout(
      () => setSilent(true),
      PLAY_SETTINGS.idle.lostNoticeSeconds * SECOND_MS
    )

    return () => {
      window.clearTimeout(timer)
      setSilent(false)
    }
  }, [isOpen])

  // Away only after a delay
  useEffect(() => {
    if (!absentKey) return
    const timer = window.setTimeout(
      () => setConfirmed(absentKey),
      PLAY_SETTINGS.idle.awaySeconds * SECOND_MS
    )

    return () => window.clearTimeout(timer)
  }, [absentKey])

  // Absent now and confirmed
  const away = useMemo(() => {
    const settled = new Set(confirmed.split(','))

    return new Set(absentKey.split(',').filter((id) => id && settled.has(id)))
  }, [absentKey, confirmed])

  const spectators = useMemo(() => {
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

  return { spectators, away, isLost: isSilent && !isOpen }
}
