'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { usePlayAct } from '@/core/hooks/data/play/usePlayAct'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'

/**
 * Field of one word sent to the table: the secret word of the setter, or a guess of the whole word
 * @param {Object} props - Form
 * @param {string} props.sessionId - Game
 * @param {'pick' | 'word'} props.type - Move sent
 * @param {string} props.placeholder - Field label
 * @param {string} props.submit - Button label
 * @param {string} [props.draw] - Label of the second button, which lets the game draw the word
 * @return {JSX.Element}
 */

export const SuspensWordForm = ({
  sessionId,
  type,
  placeholder,
  submit,
  draw,
}: {
  sessionId: string
  type: 'pick' | 'word'
  placeholder: string
  submit: string
  draw?: string
}) => {
  const { act, isSaving } = usePlayAct(sessionId)
  const [text, setText] = useState('')

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() || isSaving) return
    if (await act({ type, word: text })) setText('')
  }

  return (
    <form className={SUSPENS_BOARD.form} onSubmit={send}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className={SUSPENS_BOARD.input}
      />
      <Button type="submit" variant="arcade" isLoading={isSaving} disabled={!text.trim()}>
        {submit}
      </Button>
      {draw && (
        <Button
          type="button"
          variant="arcade"
          disabled={isSaving}
          onClick={() => act({ type: 'draw' })}
        >
          {draw}
        </Button>
      )}
    </form>
  )
}
