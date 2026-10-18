'use client'

import { useEffect, useRef } from 'react'

import type { AbsenceAutopilot } from '@/declarations/absences/demo'

/**
 * Gestures the autopilot makes on the declaration
 * @typedef {Object} AutopilotActions
 * @property {(day: string) => void} pickStart - First day
 * @property {(day: string) => void} pickEnd - Last day
 * @property {(step: number) => void} goTo - Open a step
 * @property {(reason: string) => void} write - Reason typed so far
 * @property {() => void} send - Send the declaration
 */

export interface AutopilotActions {
  pickStart: (day: string) => void
  pickEnd: (day: string) => void
  goTo: (step: number) => void
  write: (reason: string) => void
  send: () => void
}

/**
 * Wait
 * @param {number} ms - Milliseconds
 * @return {Promise<void>} - Elapsed
 */

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Plays a declaration by itself, once: the days, the reason typed letter by letter, the send
 * @param {AbsenceAutopilot | undefined} script - What to play, nothing plays nothing
 * @param {{ start: string, end: string } | null} span - Days to pick
 * @param {AutopilotActions} actions - Gestures on the declaration
 * @return {void}
 */

export const useAbsenceAutopilot = (
  script: AbsenceAutopilot | undefined,
  span: { start: string; end: string } | null,
  actions: AutopilotActions
): void => {
  const latest = useRef(actions)

  // Always the latest gestures
  useEffect(() => {
    latest.current = actions
  }, [actions])

  useEffect(() => {
    if (!script || !span) return

    let isLive = true

    const play = async () => {
      await wait(script.pauseMs)
      if (!isLive) return
      latest.current.pickStart(span.start)

      await wait(script.pauseMs)
      if (!isLive) return
      latest.current.pickEnd(span.end)

      await wait(script.pauseMs)
      if (!isLive) return
      latest.current.goTo(2)

      // Letter by letter
      for (let length = 1; length <= script.reason.length; length += 1) {
        await wait(script.typingMsPerChar)
        if (!isLive) return
        latest.current.write(script.reason.slice(0, length))
      }

      await wait(script.pauseMs)
      if (!isLive) return
      latest.current.send()
    }

    void play()

    return () => {
      isLive = false
    }
  }, [script, span])
}
