'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { CROQUIS_BOARD_COPY, CROQUIS_SETTINGS } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Time the board gets to answer before a guess counts as missed, in ms
const VERDICT_MS = 380

/**
 * Answer field, shaking on a wrong word; remount per round
 * @param {Object} props - Field
 * @param {string} props.sessionId - Game
 * @param {boolean} props.isOpen - Round still waiting for a word
 * @return {JSX.Element}
 */

export const CroquisInput = ({ sessionId, isOpen }: { sessionId: string; isOpen: boolean }) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const [text, setText] = useState('')
  const [shakes, setShakes] = useState(0)
  const field = useRef<HTMLInputElement>(null)
  // Latest openness, read after the verdict delay
  const open = useRef(isOpen)

  useEffect(() => {
    open.current = isOpen
  }, [isOpen])

  // Ready to type as the round lands, and again after a shake
  useEffect(() => field.current?.focus(), [shakes])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() || isSaving) return
    const played = await act({ type: 'guess', word: text })
    if (!played) return

    // Still open after the answer: the word was wrong
    await new Promise((resolve) => window.setTimeout(resolve, VERDICT_MS))
    if (!open.current) return
    setShakes((count) => count + 1)
    setText('')
  }

  return (
    <form
      key={shakes}
      className={cn(CROQUIS_BOARD.form, shakes > 0 && CROQUIS_BOARD.shake)}
      onSubmit={submit}
    >
      <input
        ref={field}
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={CROQUIS_SETTINGS.wordLength}
        placeholder={CROQUIS_BOARD_COPY.placeholder}
        aria-label={CROQUIS_BOARD_COPY.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={!isOpen}
        className={CROQUIS_BOARD.input}
      />
      <Button
        type="submit"
        variant="arcade"
        isLoading={isSaving}
        disabled={!isOpen || !text.trim()}
      >
        {CROQUIS_BOARD_COPY.submit}
      </Button>
    </form>
  )
}
