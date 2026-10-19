'use client'

import { useEffect, useRef } from 'react'

/**
 * Tell while a key is held down: pressed, then released, or the window left
 * @param {string} key - Key name, as KeyboardEvent.key
 * @param {(isHeld: boolean) => void} onChange - Called on the press and on the release
 * @param {boolean} [isActive] - Listens
 * @return {void}
 */

export const useHoldKey = (
  key: string,
  onChange: (isHeld: boolean) => void,
  isActive = true
): void => {
  const handler = useRef(onChange)
  useEffect(() => {
    handler.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!isActive) return

    let isHeld = false
    const set = (next: boolean) => {
      if (next === isHeld) return
      isHeld = next
      handler.current(next)
    }

    const onDown = (event: KeyboardEvent) => {
      // Alt with another key is a shortcut, never a freeze
      if (event.key === key) set(true)
      else set(false)
    }
    const onUp = (event: KeyboardEvent) => {
      if (event.key === key) set(false)
    }
    const onLeave = () => set(false)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    // A release outside the window is never heard
    window.addEventListener('blur', onLeave)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onLeave)
      // An option switched off lets go
      set(false)
    }
  }, [key, isActive])
}
