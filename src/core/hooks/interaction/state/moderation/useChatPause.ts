'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { ChatMessage } from '@/types/modview'

// Pixels from the bottom still read as following
const FOLLOW_SLACK = 48

/**
 * Why the chat stands still
 * @typedef {'scroll' | 'hover' | 'manual' | null} ChatPause
 */

export type ChatPause = 'scroll' | 'hover' | 'manual' | null

/**
 * Chat that stands still under the reader: scrolled up or hovered, lines freeze until resumed
 * @param {ChatMessage[]} messages - Live lines
 * @param {boolean} pauseOnHover - Hover freezes
 * @return {Object} - Lines shown, pause and handlers
 */

export const useChatPause = (messages: ChatMessage[], pauseOnHover: boolean) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [isScrolledUp, setScrolledUp] = useState(false)
  const [isHovered, setHovered] = useState(false)
  const [isHeld, setHeld] = useState(false)
  const [frozen, setFrozen] = useState<ChatMessage[] | null>(null)
  const pause: ChatPause = isHeld
    ? 'manual'
    : isScrolledUp
      ? 'scroll'
      : isHovered && pauseOnHover
        ? 'hover'
        : null

  // Frozen lines still show removals
  const lines = useMemo(() => {
    if (!frozen || !pause) return messages
    const latest = new Map(messages.map((message) => [message.id, message]))

    return frozen.map((line) => latest.get(line.id) ?? line)
  }, [frozen, pause, messages])

  // Follow the newest line
  useEffect(() => {
    const list = listRef.current
    if (list && !pause) list.scrollTop = list.scrollHeight
  }, [lines, pause])

  const onScroll = () => {
    const list = listRef.current
    if (!list) return
    const isUp = list.scrollHeight - list.scrollTop - list.clientHeight >= FOLLOW_SLACK
    if (isUp && !pause) setFrozen(messages)
    setScrolledUp(isUp)
  }

  const onPointerEnter = () => {
    if (!pause) setFrozen(messages)
    setHovered(true)
  }

  // Frozen while a key is held, back to the live and its end on release
  const hold = (isHeld: boolean) => {
    if (isHeld) {
      if (!pause) setFrozen(messages)
      setHeld(true)
      return
    }
    resume()
  }

  const resume = () => {
    setHeld(false)
    setScrolledUp(false)
    setHovered(false)
    setFrozen(null)
  }

  return {
    listRef,
    lines,
    pause,
    resume,
    hold,
    listHandlers: { onScroll, onPointerEnter, onPointerLeave: () => setHovered(false) },
  }
}
