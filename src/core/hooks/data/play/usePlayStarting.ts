'use client'

import { useEffect, useState } from 'react'

import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * True once the host has started the game, until the lobby gives way to the table
 * @param {string} sessionId - Game
 * @return {boolean} - Game is starting
 */

export const usePlayStarting = (sessionId: string): boolean => {
  const [isStarting, setStarting] = useState(false)
  useEffect(
    () =>
      listenRealtime(PLAY_TOPICS.session(sessionId), (event) => {
        if (event === PLAY_STREAM_EVENTS.started) setStarting(true)
      }),
    [sessionId]
  )

  return isStarting
}
