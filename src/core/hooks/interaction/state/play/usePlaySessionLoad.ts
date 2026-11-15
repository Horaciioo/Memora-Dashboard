'use client'

import { useEffect, useState } from 'react'

import { isRealtimeOpen, watchRealtime } from '@/core/lib/realtime/socket'
import { usePlaySessionLoadStore } from '@/core/store/play/playSessionLoad'
import { PLAY_SESSION_LOAD } from '@/declarations/play/loading'

/**
 * Where a table stands while it loads
 * @typedef {Object} PlaySessionLoad
 * @property {'loading' | 'done' | 'failed'} status - Outcome so far
 * @property {number} percent - Real progress, 0 to 100
 * @property {number} at - When the loading began
 */

export interface PlaySessionLoad {
  status: 'loading' | 'done' | 'failed'
  percent: number
  at: number
}

const { percent: STEPS } = PLAY_SESSION_LOAD

const CLOCK_MS = 100

// Resolves once every image of the stage has decoded
const imagesReady = (): Promise<unknown> =>
  Promise.all(
    Array.from(document.querySelectorAll<HTMLImageElement>('[data-play-stage] img')).map((image) =>
      image.complete ? Promise.resolve() : image.decode().catch(() => null)
    )
  )

// Resolves after the browser painted a frame
const painted = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

/**
 * Real loading of a table in this browser: page mounted, socket open, fonts, images, first painted frame, then heavy parts
 * @return {PlaySessionLoad} - Status, percent and start
 */

export const usePlaySessionLoad = (): PlaySessionLoad => {
  const [percent, setPercent] = useState<number>(STEPS.mounted)
  const [isLate, setLate] = useState(false)
  const [at] = useState(() => Date.now())
  // Clock of the shortest load
  const [elapsed, setElapsed] = useState(0)
  const holds = usePlaySessionLoadStore((state) => state.holds.length)

  // Steps run in order, each raises the percent
  useEffect(() => {
    let isAlive = true
    const reach = (value: number) => isAlive && setPercent((now) => Math.max(now, value))
    const socket = new Promise<void>((resolve) => {
      if (isRealtimeOpen()) return resolve()
      const stop = watchRealtime(() => {
        if (!isRealtimeOpen()) return
        stop()
        resolve()
      })
    })

    const run = async () => {
      await socket
      reach(STEPS.socket)
      await document.fonts.ready
      reach(STEPS.fonts)
      await imagesReady()
      reach(STEPS.images)
    }
    void run()

    return () => {
      isAlive = false
    }
  }, [])

  // The last step waits for heavy parts, then for a painted frame
  useEffect(() => {
    if (percent < STEPS.images || holds > 0) return
    let isAlive = true
    void painted().then(() => isAlive && setPercent(STEPS.painted))

    return () => {
      isAlive = false
    }
  }, [percent, holds])

  useEffect(() => {
    const clock = window.setInterval(() => setElapsed(Date.now() - at), CLOCK_MS)

    return () => window.clearInterval(clock)
  }, [at])

  useEffect(() => {
    const timer = window.setTimeout(() => setLate(true), PLAY_SESSION_LOAD.timeoutMs)

    return () => window.clearTimeout(timer)
  }, [])

  // Real steps, but never faster than the shortest load
  const paced = Math.min(
    percent,
    PLAY_SESSION_LOAD.floor + ((100 - PLAY_SESSION_LOAD.floor) * elapsed) / PLAY_SESSION_LOAD.minMs
  )
  if (paced >= STEPS.painted) return { status: 'done', percent: STEPS.painted, at }

  return { status: isLate ? 'failed' : 'loading', percent: paced, at }
}
