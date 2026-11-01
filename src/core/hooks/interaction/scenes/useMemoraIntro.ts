'use client'

import { useEffect, useState } from 'react'

import { typingDuration } from '@/core/lib/tour/chat'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
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

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Memora types her welcome, dots then letter by letter
 * @param {readonly string[]} script - Lines to write, kept stable
 * @return {MemoraIntro} - Welcome state
 */

export const useMemoraIntro = (script: readonly string[]): MemoraIntro => {
  const isCalm = prefersReducedMotion()
  const [intro, setIntro] = useState<MemoraIntro>({
    lines: isCalm ? [...script] : [],
    isTyping: false,
    isDone: isCalm,
  })

  useEffect(() => {
    if (isCalm) return

    let isGone = false
    const { typingMsPerChar } = ASSISTANT_SETTINGS

    const play = async () => {
      for (const [index, line] of script.entries()) {
        if (isGone) return
        setIntro((current) => ({ ...current, isTyping: true }))
        await wait(typingDuration(line.length, ASSISTANT_SETTINGS) / 2)
        for (let length = 1; length <= line.length && !isGone; length += 1) {
          const partial = line.slice(0, length)
          setIntro({ lines: [...script.slice(0, index), partial], isTyping: false, isDone: false })
          await wait(typingMsPerChar)
        }
      }
      if (!isGone) setIntro({ lines: [...script], isTyping: false, isDone: true })
    }

    void play()

    return () => {
      isGone = true
    }
  }, [script, isCalm])

  return intro
}
