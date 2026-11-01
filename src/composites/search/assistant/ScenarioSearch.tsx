'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface ScenarioSearchProps {
  placeholder?: string
  onSearch: (text: string) => void
}

/**
 * Field and button to search a name
 * @param {string} [placeholder] - Hint in the field
 * @param {(text: string) => void} onSearch - Gets the words typed
 * @return {JSX.Element}
 */

export const ScenarioSearch = ({ placeholder, onSearch }: ScenarioSearchProps) => {
  const [text, setText] = useState('')
  const typed = text.trim()

  return (
    <form
      className={ASSISTANT_STYLES.search}
      onSubmit={(event) => {
        event.preventDefault()
        if (typed) onSearch(typed)
      }}
    >
      <input
        type="search"
        autoFocus
        value={text}
        placeholder={placeholder ?? SCENARIO_COPY.textPlaceholder}
        onChange={(event) => setText(event.target.value)}
        className={ASSISTANT_STYLES.searchField}
      />
      <Button type="submit" variant="primary" disabled={!typed}>
        {SCENARIO_COPY.searchGo}
      </Button>
    </form>
  )
}
