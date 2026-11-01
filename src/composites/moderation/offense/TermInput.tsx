'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import { DETECTION_PANEL } from '@/declarations/ui/variants'

export interface TermInputProps {
  placeholder: string
  maxLength: number
  onAdd: (raw: string) => void
}

/**
 * Field adding terms
 * @param {TermInputProps} props - Placeholder and handler
 * @return {JSX.Element}
 */

export const TermInput = ({ placeholder, maxLength, onAdd }: TermInputProps) => {
  const [draft, setDraft] = useState('')

  const commit = () => {
    if (!draft.trim()) return
    onAdd(draft)
    setDraft('')
  }

  return (
    <div className={DETECTION_PANEL.entry}>
      <Input
        className={DETECTION_PANEL.entryField}
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={maxLength}
        enterKeyHint="done"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          commit()
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData('text')
          if (!/[\n,;]/.test(pasted)) return
          event.preventDefault()
          onAdd(pasted)
        }}
      />
      <Button
        variant="icon"
        icon="add"
        aria-label={SANCTION_DETECTION_COPY.add}
        disabled={!draft.trim()}
        onClick={commit}
      />
    </div>
  )
}
