'use client'

import { useEffect } from 'react'

import { foldLetter } from '@/core/lib/play/suspens'
import { SUSPENS_SETTINGS } from '@/declarations/play'

/**
 * Letters typed on the keyboard, outside any field, sent as moves
 * @param {boolean} isOpen - The viewer may play a letter
 * @param {(letter: string) => void} onLetter - Letter typed
 * @return {void}
 */

export const useLetterKeys = (isOpen: boolean, onLetter: (letter: string) => void): void => {
  useEffect(() => {
    if (!isOpen) return

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
      if (target?.closest('input, textarea, [contenteditable]')) return

      const letter = foldLetter(event.key)
      if (SUSPENS_SETTINGS.alphabet.includes(letter)) onLetter(letter)
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onLetter])
}
