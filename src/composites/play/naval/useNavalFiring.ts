'use client'

import { useState } from 'react'

import { cueTick } from '@/composites/play/naval/audio/cues'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'

// Longest wait for the board pushed after a shot, in milliseconds
const PUSH_WAIT_MS = 3000

/**
 * Aim and fire of the viewer
 * @param {string} sessionId - Game
 * @param {number} rev - Revision of the board
 * @param {string} resetKey - Changes when the aim must clear
 * @return {Object} - Aim, sending flag and handlers
 */

export const useNavalFiring = (sessionId: string, rev: number, resetKey: string) => {
  const { act, isSaving } = usePlayAct(sessionId)
  // Aim belongs to one target and one turn
  const [held, setHeld] = useState<{ x: number; y: number; key: string } | null>(null)
  const aim = held?.key === resetKey ? held : null
  // Revision a shot was sent on: shut until a newer board arrives
  const [sentRev, setSentRev] = useState<number | null>(null)

  const fire = async (target: string) => {
    if (!aim) return
    setSentRev(rev)
    const done = await act({ type: 'fire', target, x: aim.x, y: aim.y })
    if (done) window.setTimeout(() => setSentRev(null), PUSH_WAIT_MS)
    else setSentRev(null)
    setHeld(null)
  }

  return {
    aim,
    isSending: isSaving || sentRev === rev,
    pick: (x: number, y: number) => {
      cueTick()
      setHeld({ x, y, key: resetKey })
    },
    fire,
  }
}
