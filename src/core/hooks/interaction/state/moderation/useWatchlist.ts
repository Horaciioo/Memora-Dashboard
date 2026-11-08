'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ChatMessage, Chatter } from '@/types/modview'

/**
 * Viewers under watch and the lines they write
 * @typedef {Object} Watchlist
 * @property {Chatter[]} watched - Viewers followed
 * @property {ChatMessage[]} lines - Their lines, oldest first
 * @property {number} unseen - Lines written since the tab was last looked at
 * @property {(chatter: Chatter) => void} watch - Start watching
 * @property {(chatterId: string) => void} unwatch - Stop watching
 * @property {() => void} markSeen - The tab was looked at
 */

export interface Watchlist {
  watched: Chatter[]
  lines: ChatMessage[]
  unseen: number
  watch: (chatter: Chatter) => void
  unwatch: (chatterId: string) => void
  markSeen: () => void
}

/**
 * Isolate the lines of the viewers a moderator keeps an eye on
 * @param {ChatMessage[]} messages - Chat lines
 * @return {Watchlist} - Watchlist
 */

export const useWatchlist = (messages: ChatMessage[]): Watchlist => {
  const [watched, setWatched] = useState<Chatter[]>([])
  const [seen, setSeen] = useState<Set<string>>(new Set())

  // Read at click time
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const lines = useMemo(() => {
    const ids = new Set(watched.map((chatter) => chatter.id))

    return messages.filter((message) => ids.has(message.author.id))
  }, [messages, watched])

  const unseen = lines.filter((line) => !seen.has(line.id)).length

  // Lines on screen only
  const markSeen = useCallback(() => setSeen(new Set(lines.map((line) => line.id))), [lines])

  const watch = useCallback((chatter: Chatter) => {
    setWatched((current) =>
      current.some((entry) => entry.id === chatter.id) ? current : [...current, chatter]
    )
    setSeen(
      (current) =>
        new Set([
          ...current,
          ...messagesRef.current
            .filter((message) => message.author.id === chatter.id)
            .map((message) => message.id),
        ])
    )
  }, [])

  const unwatch = useCallback(
    (chatterId: string) =>
      setWatched((current) => current.filter((chatter) => chatter.id !== chatterId)),
    []
  )

  return { watched, lines, unseen, watch, unwatch, markSeen }
}
