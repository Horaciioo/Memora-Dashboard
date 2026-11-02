'use client'

import { useEffect, useState } from 'react'

import { typingDuration } from '@/core/lib/tour/chat'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { mentionLength, mentionPrefix } from '@/utils/format/mentions'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Memora's welcome so far
 * @typedef {Object} MemoraIntro
 * @property {string[]} lines - Lines written, the last one may be partial
 * @property {boolean} isTyping - Dots before a line
 * @property {boolean} isDone - Every line written
 */

export interface MemoraIntro {
  lines: string[]
  isTyping: boolean
  isDone: boolean
}

/**
 * Line Memora writes
 * @typedef {Object} IntroLine
 * @property {string} text - Line kept
 * @property {string} [draft] - Typed first, wiped, then the line is typed
 */

export interface IntroLine {
  text: string
  draft?: string
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Memora types her welcome, dots then letter by letter
 * @param {readonly IntroLine[]} script - Lines to write, kept stable
 * @return {MemoraIntro} - Welcome state
 */

export const useMemoraIntro = (script: readonly IntroLine[]): MemoraIntro => {
  const isCalm = prefersReducedMotion()
  const [intro, setIntro] = useState<MemoraIntro>({
    lines: isCalm ? script.map((line) => line.text) : [],
    isTyping: false,
    isDone: isCalm,
  })

  useEffect(() => {
    if (isCalm) return

    let isGone = false
    const { typingMsPerChar, eraseMsPerChar, draftPauseMs } = ASSISTANT_SETTINGS

    const kept = script.map((line) => line.text)

    // One line grows letter by letter
    const type = async (index: number, text: string) => {
      const total = mentionLength(text)

      for (let length = 1; length <= total && !isGone; length += 1) {
        setIntro({
          lines: [...kept.slice(0, index), mentionPrefix(text, length)],
          isTyping: false,
          isDone: false,
        })
        await wait(typingMsPerChar)
      }
    }

    // Letters leave from the end
    const erase = async (index: number, text: string) => {
      for (let length = mentionLength(text) - 1; length >= 0 && !isGone; length -= 1) {
        setIntro({
          lines: [...kept.slice(0, index), mentionPrefix(text, length)],
          isTyping: false,
          isDone: false,
        })
        await wait(eraseMsPerChar)
      }
    }

    const play = async () => {
      for (const [index, line] of script.entries()) {
        if (isGone) return
        setIntro((current) => ({ ...current, isTyping: true }))
        await wait(typingDuration(line.text.length, ASSISTANT_SETTINGS) / 2)
        if (line.draft) {
          await type(index, line.draft)
          await wait(draftPauseMs)
          await erase(index, line.draft)
          await wait(draftPauseMs / 2)
        }
        await type(index, line.text)
      }
      if (!isGone) setIntro({ lines: kept, isTyping: false, isDone: true })
    }

    void play()

    return () => {
      isGone = true
    }
  }, [script, isCalm])

  return intro
}
