'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { GOLF_KEYS } from '@/declarations/play/golf/keys'

/**
 * Key pressed while writing somewhere
 * @param {EventTarget | null} target - Focused element
 * @return {boolean} - Writing
 */

const isWriting = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/**
 * Key of a list
 * @param {readonly string[]} keys - Physical keys
 * @param {KeyboardEvent} event - Key event
 * @return {boolean} - Matches
 */

const isKey = (keys: readonly string[], event: KeyboardEvent): boolean => keys.includes(event.code)

/**
 * Keyboard of the course: turn, zoom, tilt, overview and cancel, never while writing
 * @param {RefObject<GolfRig>} rigRef - Camera rig
 * @param {Object} handlers - Gestures
 * @param {() => void} handlers.onOverview - Toggle the overview
 * @param {() => void} handlers.onCancel - Drop the aim or the placement
 * @return {void}
 */

export const useGolfKeys = (
  rigRef: RefObject<GolfRig>,
  handlers: { onOverview: () => void; onCancel: () => void }
): void => {
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    const press = (event: KeyboardEvent, isDown: boolean) => {
      if (isWriting(event.target)) return
      const rig = rigRef.current
      const sign = isDown ? 1 : 0
      if (isKey(GOLF_KEYS.left, event)) rig.turn = sign
      else if (isKey(GOLF_KEYS.right, event)) rig.turn = -sign
      else if (isKey(GOLF_KEYS.zoomIn, event)) rig.zoom = -sign
      else if (isKey(GOLF_KEYS.zoomOut, event)) rig.zoom = sign
      else if (isKey(GOLF_KEYS.pitchUp, event)) rig.climb = sign
      else if (isKey(GOLF_KEYS.pitchDown, event)) rig.climb = -sign
      else if (isDown && isKey(GOLF_KEYS.overview, event)) latest.current.onOverview()
      else if (isDown && isKey(GOLF_KEYS.cancel, event)) latest.current.onCancel()
      else return
      event.preventDefault()
    }
    const down = (event: KeyboardEvent) => press(event, true)
    const up = (event: KeyboardEvent) => press(event, false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [rigRef])
}
