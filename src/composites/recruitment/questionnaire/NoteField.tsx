'use client'

import { useEffect, useRef, useState } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { INTERVIEW } from '@/declarations/ui/variants'

// Wait after the last key before saving
const SAVE_DELAY_MS = 700

export interface NoteFieldProps {
  value: string
  disabled?: boolean
  onSave: (notes: string) => void
}

/**
 * Notes under a question, written freely and saved as the recruiter pauses
 * @param {string} value - Notes stored
 * @param {boolean} [disabled] - Blocks writing
 * @param {(notes: string) => void} onSave - Called with the notes to keep
 * @return {JSX.Element}
 */

export const NoteField = ({ value, disabled, onSave }: NoteFieldProps) => {
  const [open, setOpen] = useState(value.length > 0)
  const [draft, setDraft] = useState(value)
  const saved = useRef(value)
  const latest = useRef({ draft: value, onSave })
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flush = () => {
    clearTimeout(timer.current)
    const { draft: next, onSave: save } = latest.current
    if (next === saved.current) return

    saved.current = next
    save(next)
  }

  // Save once the typing stops
  const schedule = (next: string) => {
    setDraft(next)
    latest.current = { draft: next, onSave }
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, SAVE_DELAY_MS)
  }

  // A pending note is kept when the field goes away
  useEffect(() => flush, [])

  // The cross drops the field and the note with it
  const remove = () => {
    clearTimeout(timer.current)
    setDraft('')
    setOpen(false)
    latest.current = { draft: '', onSave }
    flush()
  }

  const Cross = ICONS.close

  if (!open && !disabled) {
    return (
      <button type="button" className={INTERVIEW.noteAdd} onClick={() => setOpen(true)}>
        {QUESTIONNAIRE_COPY.noteAdd}
      </button>
    )
  }

  if (!open) return null

  return (
    <div className={INTERVIEW.notes}>
      <button
        type="button"
        disabled={disabled}
        aria-label={QUESTIONNAIRE_COPY.noteRemove}
        title={QUESTIONNAIRE_COPY.noteRemove}
        className={INTERVIEW.noteClose}
        onClick={remove}
      >
        <Cross className="size-4" aria-hidden="true" />
      </button>
      <textarea
        autoFocus={value.length === 0}
        value={draft}
        disabled={disabled}
        maxLength={FORM_SETTINGS.markdownMaxLength}
        placeholder={QUESTIONNAIRE_COPY.notePlaceholder}
        aria-label={QUESTIONNAIRE_COPY.noteAdd}
        className={INTERVIEW.noteField}
        onChange={(event) => schedule(event.target.value)}
        onBlur={flush}
      />
    </div>
  )
}
