'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { listenStream } from '@/core/lib/api/eventStreams'
import { API_ROUTES } from '@/core/lib/api/routes'
import { isNewerBoard, toBoardState } from '@/core/lib/play/golf'
import type { GolfBoardState, GolfBoardView } from '@/core/lib/play/golf'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'

/**
 * Board shared by every golf block of a page
 * @typedef {Object} BoardSlot
 */

interface BoardSlot {
  board: GolfBoardState | undefined
  listeners: Set<() => void>
  // One read in flight, one queued behind it
  isReading: boolean
  isQueued: boolean
}

// One slot per game
const slots = new Map<string, BoardSlot>()

/**
 * Slot of a game
 * @param {string} sessionId - Game
 * @return {BoardSlot} - Slot
 */

const slotOf = (sessionId: string): BoardSlot => {
  const slot = slots.get(sessionId) ?? {
    board: undefined,
    listeners: new Set(),
    isReading: false,
    isQueued: false,
  }
  slots.set(sessionId, slot)

  return slot
}

/**
 * Keep a board when newer than the held one
 * @param {string} sessionId - Game
 * @param {GolfBoardView} raw - Board read
 * @return {void}
 */

const offerBoard = (sessionId: string, raw: GolfBoardView): void => {
  const slot = slotOf(sessionId)
  const board = toBoardState(raw)
  if (!isNewerBoard(board, slot.board)) return
  slot.board = board
  for (const listener of slot.listeners) listener()
}

/**
 * Read the board again, reads in a row merged
 * @param {string} sessionId - Game
 * @return {Promise<void>} - Read
 */

const readBoard = async (sessionId: string): Promise<void> => {
  const slot = slotOf(sessionId)
  if (slot.isReading) {
    slot.isQueued = true
    return
  }
  slot.isReading = true
  try {
    const raw = await apiGet<GolfBoardView | null>(API_ROUTES.playBoard(sessionId))
    if (raw) offerBoard(sessionId, raw)
  } catch {
    // The next signal reads again
  } finally {
    slot.isReading = false
    if (slot.isQueued) {
      slot.isQueued = false
      void readBoard(sessionId)
    }
  }
}

/**
 * Live golf board: server render first, then each move read from the stream
 * @param {string} sessionId - Game
 * @param {GolfBoardView} initial - Board of the page render
 * @return {GolfBoardState} - Newest board
 */

export const useGolfBoard = (sessionId: string, initial: GolfBoardView): GolfBoardState => {
  // Page renders count as reads
  useEffect(() => offerBoard(sessionId, initial), [sessionId, initial])

  useEffect(() => {
    const url = API_ROUTES.playSessionStream(sessionId)
    const read = () => void readBoard(sessionId)
    const stops = [
      listenStream(url, PLAY_STREAM_EVENTS.moved, read),
      // Missed moves after a drop
      listenStream(url, 'open', read),
    ]

    return () => stops.forEach((stop) => stop())
  }, [sessionId])

  const subscribe = useCallback(
    (listener: () => void) => {
      const slot = slotOf(sessionId)
      slot.listeners.add(listener)

      return () => {
        slot.listeners.delete(listener)
      }
    },
    [sessionId]
  )
  const held = useSyncExternalStore(
    subscribe,
    () => slotOf(sessionId).board,
    () => undefined
  )
  const rendered = useMemo(() => toBoardState(initial), [initial])

  return held && !isNewerBoard(rendered, held) ? held : rendered
}
