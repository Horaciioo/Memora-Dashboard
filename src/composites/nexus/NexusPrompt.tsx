'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { completeInput } from '@/core/lib/nexus/terminal/complete'
import { searchHistory, stepHistory } from '@/core/lib/nexus/terminal/history'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import type { NexusPromptMode, RegistryView } from '@/types/nexus'

export interface NexusPromptProps {
  mode: NexusPromptMode
  isBusy: boolean
  history: string[]
  registry: RegistryView
  preset: string
  onSubmit: (text: string) => void
  onClear: () => void
}

// Hint shown by the field
const PLACEHOLDERS: Record<NexusPromptMode, string> = {
  command: NEXUS_TERMINAL_COPY.unlockHint,
  password: NEXUS_TERMINAL_COPY.passwordLabel,
  reauth: NEXUS_TERMINAL_COPY.reauth,
  discord: NEXUS_TERMINAL_COPY.discordWaiting,
}

/**
 * Command line with history and completion
 * @param {NexusPromptProps} props - Prompt props
 * @return {JSX.Element}
 */

export const NexusPrompt = ({ mode, isBusy, history, registry, preset, onSubmit, onClear }: NexusPromptProps) => {
  const [text, setText] = useState(preset)
  const [cursor, setCursor] = useState(history.length)
  // A lock empties the history under the cursor
  const position = Math.min(cursor, history.length)
  const [options, setOptions] = useState<string[]>([])
  const [search, setSearch] = useState<string | null>(null)
  const field = useRef<HTMLInputElement>(null)
  const isSecret = mode === 'password' || mode === 'reauth'

  // Focus on open and after each step
  useEffect(() => field.current?.focus(), [mode, isBusy])

  const recall = (position: number) => {
    setCursor(position)
    setText(history[position] ?? '')
  }

  const searchBack = (query: string) => {
    const found = searchHistory(history, query, history.length)
    if (found >= 0) setText(history[found])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return

    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit(text)
      setText('')
      setCursor(Number.MAX_SAFE_INTEGER)
      setOptions([])
      setSearch(null)
    } else if (isSecret) return
    else if (event.key === 'ArrowUp') {
      event.preventDefault()
      recall(stepHistory(history, position, -1))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      recall(stepHistory(history, position, 1))
    } else if (event.key === 'Tab') {
      event.preventDefault()
      const done = completeInput(text, registry)
      setText(done.text)
      setOptions(done.options.length > 1 ? done.options : [])
    } else if (event.ctrlKey && event.key.toLowerCase() === 'r') {
      event.preventDefault()
      setSearch(search === null ? '' : null)
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      onClear()
    }
  }

  const change = (value: string) => {
    if (search !== null) {
      setSearch(value)
      searchBack(value)
      return
    }
    setText(value)
    setOptions([])
  }

  return (
    <>
      {options.length > 0 && (
        <p className={NEXUS_STYLES.suggestions}>
          {options.map((option) => (
            <span key={option}>{option}</span>
          ))}
        </p>
      )}
      <div className={NEXUS_STYLES.prompt}>
        <span className={NEXUS_STYLES.promptMark} aria-hidden="true">
          {search !== null ? NEXUS_TERMINAL_COPY.searchHistory : NEXUS_TERMINAL_COPY.prompt}
        </span>
        <input
          ref={field}
          className={NEXUS_STYLES.input}
          type={isSecret ? 'password' : 'text'}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={isBusy || mode === 'discord'}
          value={search ?? text}
          placeholder={PLACEHOLDERS[mode]}
          aria-label={isSecret ? NEXUS_TERMINAL_COPY.passwordLabel : NEXUS_TERMINAL_COPY.inputLabel}
          onChange={(event) => change(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </>
  )
}
