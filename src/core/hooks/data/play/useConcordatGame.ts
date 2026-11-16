'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { applyDiff, clientFromBoard, CONCORDAT_RESYNC, decodeDiff } from '@/core/lib/play/concordat'
import type { ConcordatBoard, ConcordatClientState } from '@/core/lib/play/concordat'
import { fromBase64 } from '@/core/lib/realtime/codec'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * State of one game shared by the blocks of a page
 * @typedef {Object} ConcordatSlot
 */

interface ConcordatSlot {
  client: ConcordatClientState | null
  // Bumped when the screen must redraw
  version: number
  listeners: Set<() => void>
  isQueued: boolean
}

const slots = new Map<string, ConcordatSlot>()

const slotOf = (sessionId: string): ConcordatSlot => {
  const slot = slots.get(sessionId) ?? {
    client: null,
    version: 0,
    listeners: new Set(),
    isQueued: false,
  }
  slots.set(sessionId, slot)

  return slot
}

// Redraws merge into one per frame
const touch = (slot: ConcordatSlot): void => {
  if (slot.isQueued) return

  slot.isQueued = true
  window.requestAnimationFrame(() => {
    slot.isQueued = false
    slot.version++
    for (const listener of slot.listeners) listener()
  })
}

// A board replaces everything held, an older one is ignored
const offerBoard = (slot: ConcordatSlot, board: ConcordatBoard | null | undefined): void => {
  if (!board || (slot.client && board.rev < slot.client.rev)) return

  slot.client = clientFromBoard(board)
  touch(slot)
}

/**
 * Live Concordat state: a board first, then every diff of the socket
 * @param {string} sessionId - Game
 * @param {ConcordatBoard | null} initial - Board of the page render
 * @return {{ client: ConcordatClientState | null, version: number, act: (body: Record<string, unknown>) => Promise<boolean> }} - State and commands
 */

export const useConcordatGame = (sessionId: string, initial: ConcordatBoard | null) => {
  const { act } = usePlayAct(sessionId)

  useEffect(() => offerBoard(slotOf(sessionId), initial), [sessionId, initial])

  useEffect(
    () =>
      listenRealtime(PLAY_TOPICS.session(sessionId), (event, data) => {
        const slot = slotOf(sessionId)
        if (event === PLAY_STREAM_EVENTS.board) {
          return offerBoard(slot, (data as { board?: ConcordatBoard | null } | null)?.board)
        }
        const text = (data as { d?: unknown } | null)?.d
        if (event !== PLAY_STREAM_EVENTS.diff || typeof text !== 'string' || !slot.client) return

        // A missed diff asks for a fresh board
        if (applyDiff(slot.client, decodeDiff(fromBase64(text))) === 'gap') {
          void act({ type: CONCORDAT_RESYNC })
        }
        touch(slot)
      }),
    [sessionId, act]
  )

  const subscribe = useCallback(
    (listener: () => void) => {
      const slot = slotOf(sessionId)
      slot.listeners.add(listener)

      return () => {
        slot.listeners.delete(listener)
        // A game left drops its state, the next visit starts from its render
        if (!slot.listeners.size && slots.get(sessionId) === slot) slots.delete(sessionId)
      }
    },
    [sessionId]
  )
  const version = useSyncExternalStore(
    subscribe,
    () => slotOf(sessionId).version,
    () => 0
  )

  return { client: slotOf(sessionId).client, version, act }
}
