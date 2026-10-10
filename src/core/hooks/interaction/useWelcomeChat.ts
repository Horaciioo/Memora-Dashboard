'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { nextTurn, typingDuration } from '@/core/lib/tour/chat'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import type { ChatAsk, ChatTurn } from '@/declarations/tour/chat'

/**
 * One message of the thread
 * @typedef {Object} ChatLine
 * @property {'memora' | 'me'} from - Who sent it
 * @property {string} text - Message
 */

export interface ChatLine {
  from: 'memora' | 'me'
  text: string
}

/**
 * State of the admission chat
 * @typedef {Object} WelcomeChat
 * @property {ChatLine[]} thread - Messages sent so far
 * @property {boolean} isTyping - Memora is writing
 * @property {ChatAsk | null} ask - Question waiting for an answer
 * @property {(text: string, patch?: IntakeAnswers) => void} answer - Send the answer
 */

export interface WelcomeChat {
  thread: ChatLine[]
  isTyping: boolean
  ask: ChatAsk | null
  answer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * Wait
 * @param {number} ms - Milliseconds
 * @return {Promise<void>} - Elapsed
 */

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Memora writes, then sends, one message at a time, then waits for the answer
 * @param {ChatTurn[]} script - Memora's turns
 * @param {string} name - Member the messages greet
 * @param {(answers: IntakeAnswers) => void} onDone - Called with the answers when the script ends
 * @return {WelcomeChat} - Thread and gestures
 */

export const useWelcomeChat = (
  script: ChatTurn[],
  name: string,
  onDone: (answers: IntakeAnswers) => void
): WelcomeChat => {
  const [turn, setTurn] = useState(0)
  const [thread, setThread] = useState<ChatLine[]>([])
  const [isTyping, setTyping] = useState(false)
  const [ask, setAsk] = useState<ChatAsk | null>(null)
  const answers = useRef<IntakeAnswers>({})
  const done = useRef(onDone)

  // Always the latest handler
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  // Go to the turn after this one, or end
  const advance = useCallback(
    (from: number) => {
      const next = nextTurn(script, from, answers.current)

      if (next === null) done.current(answers.current)
      else setTurn(next)
    },
    [script]
  )

  // Play the turn
  useEffect(() => {
    const current = script[turn]
    if (!current) return

    let isLive = true

    const play = async () => {
      for (const line of current.say) {
        const text = line.replace('{name}', name)

        setTyping(true)
        await wait(typingDuration(text.length, TOUR_SETTINGS))
        if (!isLive) return

        setTyping(false)
        setThread((lines) => [...lines, { from: 'memora', text }])
        await wait(TOUR_SETTINGS.sendPauseMs)
        if (!isLive) return
      }

      if (current.ask) setAsk(current.ask)
      else advance(turn)
    }

    void play()

    return () => {
      isLive = false
    }
  }, [turn, script, name, advance])

  const answer = useCallback(
    (text: string, patch: IntakeAnswers = {}) => {
      answers.current = { ...answers.current, ...patch }
      setAsk(null)
      setThread((lines) => [...lines, { from: 'me', text }])
      advance(turn)
    },
    [advance, turn]
  )

  return { thread, isTyping, ask, answer }
}
