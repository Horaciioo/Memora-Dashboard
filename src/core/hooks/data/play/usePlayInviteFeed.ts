'use client'

import { useEffect, useRef } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { playSound } from '@/core/lib/play/sounds'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { usePlayInviteStore } from '@/core/store/playInvites'
import { usePlaySoundStore } from '@/core/store/playSound'
import { PLAY_INVITE_SETTINGS, PLAY_INVITE_SOUND } from '@/declarations/play/invites'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import type { PlayInviteView } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Keep the member's invitations fresh: pushed by the socket, a slow poll and a read on focus
 * @return {void}
 */

export const usePlayInviteFeed = (): void => {
  // Invitations already heard, none before the first read
  const known = useRef<Set<string> | null>(null)

  useEffect(() => {
    let isAlive = true
    const read = async () => {
      const invites = await apiGet<PlayInviteView[]>(API_ROUTES.playInvites).catch(() => null)
      if (!invites || !isAlive) return

      // Chime for an invitation landing now
      const heard = known.current
      known.current = new Set(invites.map((invite) => invite.id))
      const { isMuted, volume } = usePlaySoundStore.getState()
      if (heard && !isMuted && invites.some((invite) => !heard.has(invite.id))) {
        playSound(PLAY_INVITE_SOUND, volume)
      }
      usePlayInviteStore.getState().receive(invites)
    }
    const onRead = () => void read()
    // Every signal of the topic, the catch up after a drop included
    const stop = listenRealtime(PLAY_TOPICS.invites, onRead)
    onRead()
    const timer = window.setInterval(onRead, PLAY_INVITE_SETTINGS.pollSeconds * SECOND_MS)
    window.addEventListener('focus', onRead)

    return () => {
      isAlive = false
      stop()
      window.clearInterval(timer)
      window.removeEventListener('focus', onRead)
    }
  }, [])
}
