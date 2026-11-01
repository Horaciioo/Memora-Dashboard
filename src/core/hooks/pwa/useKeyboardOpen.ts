'use client'

import { useEffect, useState } from 'react'

// Elements that summon the virtual keyboard
const TYPING_TARGETS =
  'input:not([type="checkbox"],[type="radio"],[type="button"]),textarea,select,[contenteditable="true"]'

/**
 * Whether a field holds the focus, the virtual keyboard then covers the bottom edge
 * @return {boolean} - Typing
 */

export const useKeyboardOpen = (): boolean => {
  const [isTyping, setTyping] = useState(false)

  useEffect(() => {
    const read = () => setTyping(document.activeElement?.matches(TYPING_TARGETS) ?? false)

    document.addEventListener('focusin', read)
    document.addEventListener('focusout', read)

    return () => {
      document.removeEventListener('focusin', read)
      document.removeEventListener('focusout', read)
    }
  }, [])

  return isTyping
}
