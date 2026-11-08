'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { typingDuration } from '@/core/lib/tour/chat'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { ChatLine } from '@/core/hooks/interaction/scenes/useWelcomeChat'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Talk Memora leads in a page
 * @typedef {Object} MemoraSpeech
 * @property {ChatLine[]} thread - Entries so far
 * @property {boolean} isTyping - Memora is writing
 * @property {(texts: string[]) => Promise<void>} say - Memora writes lines one after the other
 * @property {(text: string) => void} hear - The person's line
 * @property {() => void} show - Draw the identity in the thread
 */

export interface MemoraSpeech {
  thread: ChatLine[]
  isTyping: boolean
  say: (texts: string[]) => Promise<void>
  hear: (text: string) => void
  show: () => void
}

// One part only
const SPEECH_STAGE = 'presentation'

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Memora writing line by line after her typing dots
 * @return {MemoraSpeech} - Thread and gestures
 */

export const useMemoraSpeech = (): MemoraSpeech => {
  const [thread, setThread] = useState<ChatLine[]>([])
  const [isTyping, setTyping] = useState(false)
  const isAlive = useRef(true)

  // Stops writing once the page is left
  useEffect(() => {
    isAlive.current = true

    return () => {
      isAlive.current = false
    }
  }, [])

  const say = useCallback(async (texts: string[]) => {
    for (const text of texts) {
      setTyping(true)
      if (!prefersReducedMotion()) await wait(typingDuration(text.length, ASSISTANT_SETTINGS))
      if (!isAlive.current) return

      setThread((lines) => [...lines, { from: 'memora', text, stage: SPEECH_STAGE }])
    }

    setTyping(false)
  }, [])

  const hear = useCallback(
    (text: string) => setThread((lines) => [...lines, { from: 'me', text, stage: SPEECH_STAGE }]),
    []
  )

  const show = useCallback(
    () => setThread((lines) => [...lines, { from: 'memora', scene: 'identity', stage: SPEECH_STAGE }]),
    []
  )

  return { thread, isTyping, say, hear, show }
}
