'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'

/**
 * How a game turns a read into a held board
 * @typedef {Object} LiveBoardShape
 */

export interface LiveBoardShape<View, State> {
  toState: (view: View) => State
  isNewer: (next: State, current: State | undefined) => boolean
}

/**
 * Board shared by every block of a page
 * @typedef {Object} BoardSlot
 */

interface BoardSlot {
  board: unknown
  listeners: Set<() => void>
}

// One slot per game
const slots = new Map<string, BoardSlot>()

/**
 * Slot of a game
 * @param {string} sessionId - Game
 * @return {BoardSlot} - Slot
 */

const slotOf = (sessionId: string): BoardSlot => {
  const slot = slots.get(sessionId) ?? { board: undefined, listeners: new Set() }
  slots.set(sessionId, slot)

  return slot
}

/**
 * Keep a board when newer than the held one
 * @param {string} sessionId - Game
 * @param {View} raw - Board read
 * @param {LiveBoardShape<View, State>} shape - Game reading
 * @return {void}
 */

const offerBoard = <View, State>(
  sessionId: string,
  raw: View,
  shape: LiveBoardShape<View, State>
): void => {
  const slot = slotOf(sessionId)
  const board = shape.toState(raw)
  if (!shape.isNewer(board, slot.board as State | undefined)) return
  slot.board = board
  for (const listener of slot.listeners) listener()
}

/**
 * Plain board ordered by its server clock
 * @param {{ serverTime: Date | string }} next - Board offered
 * @param {{ serverTime: Date | string } | undefined} current - Board held
 * @return {boolean} - Offered one is newer
 */

export const isLaterBoard = <State extends { serverTime: Date | string }>(
  next: State,
  current: State | undefined
): boolean =>
  !current || new Date(next.serverTime).getTime() > new Date(current.serverTime).getTime()

/**
 * Live board: server render first, then each board the socket pushes
 * @param {string} sessionId - Game
 * @param {View} initial - Board of the page render
 * @param {LiveBoardShape<View, State>} shape - Game reading, stable
 * @return {State} - Newest board
 */

export const useLiveBoard = <View, State>(
  sessionId: string,
  initial: View,
  shape: LiveBoardShape<View, State>
): State => {
  // Page renders count as reads
  useEffect(() => offerBoard(sessionId, initial, shape), [sessionId, initial, shape])

  // The server pushes the board on joining and after each move
  useEffect(
    () =>
      listenRealtime(PLAY_TOPICS.session(sessionId), (event, data) => {
        const board = (data as { board?: View } | null)?.board
        if (event === PLAY_STREAM_EVENTS.board && board) offerBoard(sessionId, board, shape)
      }),
    [sessionId, shape]
  )

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
    () => slotOf(sessionId).board as State | undefined,
    () => undefined
  )
  const rendered = useMemo(() => shape.toState(initial), [initial, shape])

  return held && !shape.isNewer(rendered, held) ? held : rendered
}
