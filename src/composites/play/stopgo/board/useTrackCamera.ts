import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { useStopGoCameraStore } from '@/core/store/play/stopgoCamera'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'

export interface TrackCameraOptions {
  scroller: RefObject<HTMLDivElement | null>
  // Scroll position that centres the own car
  getFocusTop: () => number
  // Changes when the car moves or the turn opens
  followKey: string
  isActive: boolean
}

const TYPING = /^(INPUT|TEXTAREA|SELECT)$/

/**
 * Vertical camera, glides to the car, follows it until the reader scrolls, keys move it
 * @param {TrackCameraOptions} options - Scroller and focus
 * @return {void}
 */

export const useTrackCamera = ({
  scroller,
  getFocusTop,
  followKey,
  isActive,
}: TrackCameraOptions) => {
  const frame = useRef(0)
  const userAt = useRef(0)
  const isFirst = useRef(true)
  const focus = useRef(getFocusTop)
  useEffect(() => {
    focus.current = getFocusTop
  })
  const tick = useStopGoCameraStore((state) => state.recenterTick)

  const glideTo = useCallback(
    (wanted: number, isInstant = false) => {
      const box = scroller.current
      if (!box) return
      cancelAnimationFrame(frame.current)
      const max = box.scrollHeight - box.clientHeight
      const to = Math.min(Math.max(wanted, 0), max)
      const from = box.scrollTop
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isInstant || isReduced || Math.abs(to - from) < 2) {
        box.scrollTo({ top: to, behavior: 'instant' })

        return
      }

      const began = performance.now()
      const step = (now: number) => {
        const share = Math.min((now - began) / STOPGO_TRACK.camera.glideMs, 1)
        const eased = share < 0.5 ? 4 * share ** 3 : 1 - (-2 * share + 2) ** 3 / 2
        box.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' })
        if (share < 1) frame.current = requestAnimationFrame(step)
      }
      frame.current = requestAnimationFrame(step)
    },
    [scroller]
  )

  // Reader takes the camera, the glide stops and the follow waits
  useEffect(() => {
    const box = scroller.current
    if (!box) return
    const take = () => {
      userAt.current = performance.now()
      cancelAnimationFrame(frame.current)
    }
    const events = ['wheel', 'touchstart', 'pointerdown'] as const
    events.forEach((name) => box.addEventListener(name, take, { passive: true }))

    return () => events.forEach((name) => box.removeEventListener(name, take))
  }, [scroller])

  // Follow, first placement is instant
  useEffect(() => {
    if (!isActive) return
    const isFirstPlacement = isFirst.current
    isFirst.current = false
    const waited = performance.now() - userAt.current
    if (!isFirstPlacement && waited < STOPGO_SETTINGS.cameraResumeSeconds * 1000) return
    glideTo(focus.current(), isFirstPlacement)
  }, [followKey, isActive, glideTo])

  // HUD key
  useEffect(() => {
    if (!tick) return
    userAt.current = 0
    glideTo(focus.current())
  }, [tick, glideTo])

  // Keyboard, ignored while writing
  useEffect(() => {
    if (!isActive) return
    const onKey = (event: KeyboardEvent) => {
      const box = scroller.current
      const target = event.target as HTMLElement | null
      if (!box || event.metaKey || event.ctrlKey || event.altKey) return
      if (target && (TYPING.test(target.tagName) || target.isContentEditable)) return

      const { step, pageShare } = STOPGO_TRACK.camera
      const page = box.clientHeight * pageShare
      const moves: Record<string, () => number> = {
        ArrowUp: () => box.scrollTop - step,
        ArrowDown: () => box.scrollTop + step,
        PageUp: () => box.scrollTop - page,
        PageDown: () => box.scrollTop + page,
        Home: () => box.scrollHeight,
        End: () => 0,
        c: () => focus.current(),
        C: () => focus.current(),
      }
      const move = moves[event.key]
      if (!move) return
      event.preventDefault()
      userAt.current = event.key === 'c' || event.key === 'C' ? 0 : performance.now()
      glideTo(move())
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [scroller, isActive, glideTo])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return glideTo
}
