'use client'

import { useCallback, useEffect, useRef } from 'react'

import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import type { CroquisStroke } from '@/core/lib/play/croquis/strokes'
import { CROQUIS_PEN } from '@/declarations/play'

/**
 * Change of the drawing sent to the table
 * @typedef {Object} StrokeMessage
 */

type StrokeMessage =
  { type: 'stroke'; index: number; stroke: CroquisStroke } | { type: 'undo' } | { type: 'clear' }

// Message waiting its turn
interface Queued {
  message: StrokeMessage
  isFinal: boolean
}

/**
 * Drawing changes sent in order, the stroke being drawn trimmed to its latest version
 * @param {string} sessionId - Game
 * @return {(message: StrokeMessage, isFinal?: boolean) => void} - Queue a change
 */

export const useStrokeQueue = (sessionId: string) => {
  const { act } = usePlayAct(sessionId)
  const send = useRef(act)
  const queue = useRef<Queued[]>([])
  const isBusy = useRef(false)
  const isAlive = useRef(true)

  useEffect(() => {
    send.current = act
  }, [act])

  useEffect(() => {
    isAlive.current = true

    return () => {
      isAlive.current = false
    }
  }, [])

  const drain = useCallback(async () => {
    if (isBusy.current) return
    isBusy.current = true

    while (queue.current.length && isAlive.current) {
      // The stroke in progress waits a beat so its points travel together
      if (!queue.current[0].isFinal && queue.current[0].message.type === 'stroke') {
        await new Promise((resolve) => window.setTimeout(resolve, CROQUIS_PEN.sendGapMs))
      }
      const next = queue.current.shift()
      if (next) await send.current({ ...next.message })
    }

    isBusy.current = false
  }, [])

  return useCallback(
    (message: StrokeMessage, isFinal = true) => {
      const same = queue.current.findIndex(
        (entry) =>
          entry.message.type === 'stroke' &&
          message.type === 'stroke' &&
          entry.message.index === message.index
      )
      if (same >= 0) queue.current[same] = { message, isFinal }
      else queue.current.push({ message, isFinal })
      void drain()
    },
    [drain]
  )
}
