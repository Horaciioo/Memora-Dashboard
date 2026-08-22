'use client'

import { useState } from 'react'
import { TAGS_STYLES } from '@/declarations/ui/variants'
import { ICONS } from '@/declarations/ui/icons'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { cn } from '@/utils/classnames'

export interface TagsInputProps {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxItems?: number
  invalid?: boolean
}

/**
 * Free text list, entries confirmed with Enter or a comma
 * @param {string} id - Identifier of the inner control
 * @param {string[]} value - Current entries
 * @param {(value: string[]) => void} onChange - Entries handler
 * @param {string} [placeholder] - Placeholder of the inner control
 * @param {number} [maxItems] - Most entries allowed
 * @param {boolean} [invalid] - Paints the rejection border
 * @return {JSX.Element}
 */

export const TagsInput = ({
  id,
  value,
  onChange,
  placeholder,
  maxItems,
  invalid,
}: TagsInputProps) => {
  const [draft, setDraft] = useState('')
  const RemoveIcon = ICONS.close

  const commit = () => {
    const entry = draft.trim()
    setDraft('')

    // Duplicates and overflow are dropped silently
    if (entry.length === 0 || value.includes(entry)) return
    if (maxItems !== undefined && value.length >= maxItems) return

    onChange([...value, entry])
  }

  return (
    <div className={cn(TAGS_STYLES.field, invalid && 'border-[var(--color-danger)]')}>
      {value.map((entry) => (
        <span key={entry} className={TAGS_STYLES.tag}>
          {entry}
          <button
            type="button"
            className={TAGS_STYLES.remove}
            aria-label={`${ACTION_COPY.delete} ${entry}`}
            onClick={() => onChange(value.filter((item) => item !== entry))}
          >
            <RemoveIcon className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        className={TAGS_STYLES.input}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            commit()
            return
          }

          // Backspace on an empty draft removes the last entry
          if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
      />
    </div>
  )
}
