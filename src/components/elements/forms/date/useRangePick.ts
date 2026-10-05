'use client'

import { useCallback, useEffect, useState } from 'react'
import { orderKeys } from '@/utils/format/calendar'

export interface RangePickOptions {
  isOpen: boolean
  enabled: boolean
  // Range already stored
  committed: [string, string] | null
  onCommit: (range: [string, string]) => void
}

/**
 * Two-click or drag range selection
 * @param {RangePickOptions} options - Panel state and handler
 * @return {Object} - Highlighted span and gestures
 */

export const useRangePick = ({ isOpen, enabled, committed, onCommit }: RangePickOptions) => {
  const [anchor, setAnchor] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const reset = useCallback(() => {
    setAnchor(null)
    setPreview(null)
  }, [])

  const commit = useCallback(
    (first: string, second: string) => {
      onCommit(orderKeys(first, second))
      reset()
    },
    [onCommit, reset]
  )

  // First click anchors, the second commits
  const step = (day: string): boolean => {
    if (anchor !== null) {
      commit(anchor, day)
      return false
    }

    setAnchor(day)
    setPreview(day)

    return true
  }

  // A drag across days commits on release
  useEffect(() => {
    if (!isOpen || !enabled) return

    const onUp = () => {
      if (anchor !== null && preview !== null && preview !== anchor) commit(anchor, preview)
    }

    window.addEventListener('pointerup', onUp)

    return () => window.removeEventListener('pointerup', onUp)
  }, [isOpen, enabled, anchor, preview, commit])

  const span = anchor !== null && preview !== null ? orderKeys(anchor, preview) : committed

  return { isAnchored: anchor !== null, span, step, hover: setPreview, reset }
}
