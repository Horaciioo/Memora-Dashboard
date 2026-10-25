'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { BOMB_BOARD_COPY, BOMB_SETTINGS } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'

/**
 * Word field of the player on turn, typing shown live to the table
 * @param {Object} props - Field
 * @param {string} props.sessionId - Game
 * @param {string} props.initial - Text already typed
 * @return {JSX.Element}
 */

export const BombInput = ({ sessionId, initial }: { sessionId: string; initial: string }) => {
  const { act, isSaving } = usePlayAct(sessionId)
  // Typing runs apart, the button never spins on it
  const typing = usePlayAct(sessionId)
  const [text, setText] = useState(initial)
  const field = useRef<HTMLInputElement>(null)
  const pending = useRef<number | null>(null)

  // Focus as the bomb lands
  useEffect(() => field.current?.focus(), [])

  // Drop the queued keystroke on leave
  useEffect(
    () => () => {
      if (pending.current) window.clearTimeout(pending.current)
    },
    []
  )

  // Latest text, once per pace
  const share = (next: string) => {
    setText(next)
    if (pending.current) return
    pending.current = window.setTimeout(() => {
      pending.current = null
      void typing.act({ type: 'type', text: field.current?.value ?? next }, { quiet: true })
    }, BOMB_SETTINGS.typingPaceMs)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (text.trim()) void act({ type: 'submit', word: text })
  }

  return (
    <form className={BOMB_BOARD.form} onSubmit={submit}>
      <input
        ref={field}
        value={text}
        onChange={(event) => share(event.target.value)}
        maxLength={BOMB_SETTINGS.wordLength}
        placeholder={BOMB_BOARD_COPY.placeholder}
        aria-label={BOMB_BOARD_COPY.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={BOMB_BOARD.input}
      />
      <Button type="submit" variant="arcade" isLoading={isSaving} disabled={!text.trim()}>
        {BOMB_BOARD_COPY.submit}
      </Button>
    </form>
  )
}
