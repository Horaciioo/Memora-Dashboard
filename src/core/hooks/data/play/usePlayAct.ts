'use client'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { isRealtimeOpen, requestRealtime } from '@/core/lib/realtime/socket'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { REALTIME_OPS } from '@/declarations/system/realtime'

/**
 * Send one move, through the socket when open, the board then pushed back
 * @param {string} sessionId - Game
 * @param {Record<string, unknown>} body - Move
 * @return {Promise<boolean>} - Played
 */

const sendMove = async (sessionId: string, body: Record<string, unknown>): Promise<boolean> => {
  await (isRealtimeOpen()
    ? requestRealtime(REALTIME_OPS.playAct, { sessionId, body })
    : apiPost(API_ROUTES.playAct(sessionId), body))

  return true
}

/**
 * Send one game move
 * @param {string} sessionId - Game
 * @return {Object} - act and pending flag
 */

export const usePlayAct = (sessionId: string) => {
  const { isSaving, run } = useMutation()

  return {
    isSaving,
    act: async (body: Record<string, unknown>) => {
      const done = await run(() => sendMove(sessionId, body))

      return done !== null
    },
  }
}
