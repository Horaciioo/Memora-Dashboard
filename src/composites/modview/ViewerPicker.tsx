'use client'

import { useState } from 'react'

import { matchChatters } from '@/core/lib/modview/compose'
import { MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import { MODVIEW_PICKER } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'

export interface ViewerPickerProps {
  chatters: Chatter[]
  value: Chatter | null
  onPick: (chatter: Chatter | null) => void
}

/**
 * Field to type a viewer name, the matching chatters listed under it
 * @param {ViewerPickerProps} props - Candidates, chosen viewer and pick handler
 * @return {JSX.Element}
 */

export const ViewerPicker = ({ chatters, value, onPick }: ViewerPickerProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const matches =
    isOpen && query.trim() ? matchChatters(chatters, query.trim().replace(/^@/, '')) : []

  return (
    <div className={MODVIEW_PICKER.root}>
      <input
        className={MODVIEW_PICKER.input}
        placeholder={MODVIEW_PANEL_COPY.pickPlaceholder}
        aria-label={MODVIEW_PANEL_COPY.pickPlaceholder}
        value={isOpen ? query : (value?.name ?? query)}
        onFocus={() => {
          setQuery('')
          setIsOpen(true)
        }}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
          if (value) onPick(null)
        }}
      />
      {isOpen && query.trim() !== '' && (
        <ul className={MODVIEW_PICKER.list} role="listbox">
          {matches.length === 0 && (
            <li className={MODVIEW_PICKER.empty}>{MODVIEW_PANEL_COPY.pickNone}</li>
          )}
          {matches.map((chatter) => (
            <li key={chatter.id}>
              <button
                type="button"
                role="option"
                aria-selected={value?.id === chatter.id}
                className={MODVIEW_PICKER.option}
                // Before the field loses focus
                onMouseDown={(event) => {
                  event.preventDefault()
                  onPick(chatter)
                  setQuery(chatter.name)
                  setIsOpen(false)
                }}
              >
                {chatter.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
