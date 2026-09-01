'use client'

import { useCallback, useState } from 'react'

/**
 * Hold a local draft that resets when its source changes
 * @param {T} source - Value owned upstream
 * @return {[T, (value: T) => void]} - Draft and setter
 */

export const useSyncedState = <T>(source: T): [T, (value: T) => void] => {
  const [state, setState] = useState({ draft: source, source })

  // Reset without an effect, React re-renders straight away
  if (state.source !== source) setState({ draft: source, source })

  // Stable across renders, so a caller may list it as a dependency
  const setDraft = useCallback((draft: T) => setState((current) => ({ ...current, draft })), [])

  return [state.draft, setDraft]
}
