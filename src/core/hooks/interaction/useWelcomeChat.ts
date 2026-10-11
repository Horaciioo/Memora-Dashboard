'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { nextTurn, typingDuration } from '@/core/lib/tour/chat'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import type { ChatAsk, ChatScene, ChatStage, ChatTurn } from '@/declarations/tour/chat'

/**
 * One entry of the thread, a message or a scene Memora plays
 * @typedef {Object} ChatLine
 * @property {'memora' | 'me'} from - Who sent it
 * @property {string} [text] - Message
 * @property {ChatScene} [scene] - Scene played in the thread
 * @property {ChatStage} stage - Part of the welcome it was said in
 */

export interface ChatLine {
  from: 'memora' | 'me'
  text?: string
  scene?: ChatScene
  stage: ChatStage
}

/**
 * State of the admission chat
 * @typedef {Object} WelcomeChat
 * @property {ChatLine[]} thread - Messages sent so far
 * @property {boolean} isTyping - Memora is writing
 * @property {ChatAsk | null} ask - Question waiting for an answer
 * @property {ChatStage} stage - Part of the welcome being played
 * @property {string} draft - What is being written in the chat bar for the member
 * @property {number | null} holdMs - Wait before the next part, null when none
 * @property {(text: string, patch?: IntakeAnswers) => void} answer - Send the answer
 */

export interface WelcomeChat {
  thread: ChatLine[]
  isTyping: boolean
  ask: ChatAsk | null
  stage: ChatStage
  draft: string
  holdMs: number | null
  answer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * Wait
 * @param {number} ms - Milliseconds
 * @return {Promise<void>} - Elapsed
 */

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * How long a scene holds the conversation
 * @param {ChatScene} scene - Scene played
 * @return {number} - Milliseconds
 */

const sceneHold = (scene: ChatScene): number =>
  scene === 'notify'
    ? TOUR_SETTINGS.demoStepMs * TOUR_SETTINGS.demoBeats
    : TOUR_SETTINGS.sendPauseMs

/**
 * Memora writes, then sends, one message at a time, then waits for the answer
 * @param {ChatTurn[]} script - Memora's turns
 * @param {{ name: string, creator: string | null }} who - Member and creator the messages name
 * @param {(answers: IntakeAnswers) => void} onDone - Called with the answers when the script ends
 * @return {WelcomeChat} - Thread and gestures
 */

export const useWelcomeChat = (
  script: ChatTurn[],
  who: { name: string; creator: string | null },
  onDone: (answers: IntakeAnswers) => void
): WelcomeChat => {
  const [turn, setTurn] = useState(0)
  const [thread, setThread] = useState<ChatLine[]>([])
  const [isTyping, setTyping] = useState(false)
  const [ask, setAsk] = useState<ChatAsk | null>(null)
  const [draft, setDraft] = useState('')
  const [holdMs, setHoldMs] = useState<number | null>(null)
  const hold = useRef<number | undefined>(undefined)
  const answers = useRef<IntakeAnswers>({})
  const done = useRef(onDone)

  // Always the latest handler
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  // Go to the turn after this one, or end, a new part waits a few seconds first
  const advance = useCallback(
    (from: number) => {
      const next = nextTurn(script, from, answers.current)

      if (next === null) {
        done.current(answers.current)
        return
      }

      const isNewPart = script[next]?.stage !== script[from]?.stage
      if (!isNewPart || TOUR_SETTINGS.stageHoldMs === 0) {
        setTurn(next)
        return
      }

      setHoldMs(TOUR_SETTINGS.stageHoldMs)
      hold.current = window.setTimeout(() => {
        setHoldMs(null)
        setTurn(next)
      }, TOUR_SETTINGS.stageHoldMs)
    },
    [script]
  )

  // A wait never outlives the chat
  useEffect(() => () => window.clearTimeout(hold.current), [])

  // Play the turn
  useEffect(() => {
    const current = script[turn]
    if (!current) return

    let isLive = true

    const play = async () => {
      // A line naming a missing creator is left out
      const lines = current.say.filter(
        (line) => who.creator !== null || !line.includes('{creator}')
      )

      for (const line of lines) {
        const text = line.replace('{name}', who.name).replace('{creator}', who.creator ?? '')

        setTyping(true)
        await wait(typingDuration(text.length, TOUR_SETTINGS))
        if (!isLive) return

        setTyping(false)
        setThread((lines) => [...lines, { from: 'memora', text, stage: current.stage }])
        await wait(TOUR_SETTINGS.sendPauseMs)
        if (!isLive) return
      }

      // The scene plays where the messages stopped, a question waits for it
      if (current.scene) {
        setThread((entries) => [
          ...entries,
          { from: 'memora', scene: current.scene, stage: current.stage },
        ])
        await wait(sceneHold(current.scene))
        if (!isLive) return
      }

      // The member's question is written in the chat bar for him, then sent
      if (current.ask === 'question' && current.question) {
        for (let length = 1; length <= current.question.length; length += 1) {
          await wait(TOUR_SETTINGS.typingMsPerChar)
          if (!isLive) return
          setDraft(current.question.slice(0, length))
        }

        await wait(TOUR_SETTINGS.sendPauseMs * 2)
        if (!isLive) return

        setDraft('')
        setThread((lines) => [
          ...lines,
          { from: 'me', text: current.question, stage: current.stage },
        ])
        await wait(TOUR_SETTINGS.sendPauseMs)
        if (!isLive) return

        advance(turn)
      } else if (current.ask) setAsk(current.ask)
      else advance(turn)
    }

    void play()

    return () => {
      isLive = false
    }
  }, [turn, script, who.name, who.creator, advance])

  const answer = useCallback(
    (text: string, patch: IntakeAnswers = {}) => {
      answers.current = { ...answers.current, ...patch }
      setAsk(null)
      setThread((lines) => [
        ...lines,
        { from: 'me', text, stage: script[turn]?.stage ?? lines.at(-1)?.stage ?? 'presentation' },
      ])
      advance(turn)
    },
    [advance, script, turn]
  )

  // The part of the welcome the current turn belongs to
  const stage = script[turn]?.stage ?? script[0]?.stage ?? 'presentation'

  return { thread, isTyping, ask, stage, draft, holdMs, answer }
}
