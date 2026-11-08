'use client'

import { useEffect, useRef, useState } from 'react'

import { PLAY_BUBBLES } from '@/declarations/play'
import type { PlayMessageView } from '@/types/play'
import { PlayMessageKinds } from '@/utils/constants/play'

/**
 * Lines heard since mount, each kept a few seconds
 * @param {PlayMessageView[]} lines - Chat lines
 * @return {PlayMessageView[]} - Lines still shown
 */

export const usePlayBubbles = (lines: PlayMessageView[]): PlayMessageView[] => {
  const seen = useRef<Set<string> | null>(null)
  const timers = useRef<number[]>([])
  const [live, setLive] = useState<PlayMessageView[]>([])

  useEffect(() => {
    // First pass is history
    if (!seen.current) {
      seen.current = new Set(lines.map((line) => line.id))
      return
    }
    const known = seen.current
    const fresh = lines.filter((line) => !known.has(line.id) && line.kind === PlayMessageKinds.Text)
    lines.forEach((line) => known.add(line.id))
    if (!fresh.length) return

    // Show then expire
    setLive((current) => [...current, ...fresh].slice(-PLAY_BUBBLES.max))
    fresh.forEach((line) =>
      timers.current.push(
        window.setTimeout(
          () => setLive((current) => current.filter((entry) => entry.id !== line.id)),
          PLAY_BUBBLES.ttlMs
        )
      )
    )
  }, [lines])

  useEffect(() => {
    const pending = timers.current

    return () => pending.forEach(window.clearTimeout)
  }, [])

  return live
}
