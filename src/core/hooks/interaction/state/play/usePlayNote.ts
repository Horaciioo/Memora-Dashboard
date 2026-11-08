'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// How long the note stays up
const NOTE_MS = 3000

/**
 * Short floating note, gone by itself
 * @return {{ note: string | null, show: (text: string) => void }} - Text and opener
 */

export const usePlayNote = () => {
  const [note, setNote] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current)
    setNote(text)
    timer.current = setTimeout(() => setNote(null), NOTE_MS)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  return { note, show }
}
