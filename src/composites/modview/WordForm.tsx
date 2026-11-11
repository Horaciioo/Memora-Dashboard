'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { MODVIEW_PERSONAL, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_TERMS } from '@/declarations/ui/variants'

export interface WordFormProps {
  placeholder: string
  isFull: boolean
  onAdd: (term: string) => void
}

/**
 * Field adding one word to a personal list
 * @param {WordFormProps} props - Placeholder, fullness and add handler
 * @return {JSX.Element}
 */

export const WordForm = ({ placeholder, isFull, onAdd }: WordFormProps) => {
  const [term, setTerm] = useState('')
  const canAdd = term.trim() !== '' && !isFull

  return (
    <form
      className={MODVIEW_TERMS.form}
      onSubmit={(event) => {
        event.preventDefault()
        if (!canAdd) return
        onAdd(term.trim())
        setTerm('')
      }}
    >
      <Input
        value={term}
        maxLength={MODVIEW_PERSONAL.maxWordLength}
        placeholder={isFull ? MODVIEW_PERSONAL_COPY.listFull : placeholder}
        aria-label={placeholder}
        disabled={isFull}
        onChange={(event) => setTerm(event.target.value)}
      />
      <Button type="submit" variant="secondary" disabled={!canAdd}>
        {MODVIEW_PERSONAL_COPY.add}
      </Button>
    </form>
  )
}
