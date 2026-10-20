'use client'

import { useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent } from 'react'

import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { DiscordComposer, mentionChoices } from '@/components/elements/forms/DiscordComposer'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface InlineAnnouncementProps {
  id: string
  value: string
  mentions: FieldOption[]
  author: string
  avatarUrl?: string | null
  time?: string
  disabled?: boolean
  maxLength?: number
  // Told whenever the bar opens or closes
  onEditingChange?: (editing: boolean) => void
  onCommit: (value: string) => Promise<boolean>
}

/**
 * Discord message that turns into its own message bar on click
 * @param {string} id - Identifier of the bar
 * @param {string} value - Stored markdown
 * @param {FieldOption[]} mentions - Directory of mentions
 * @param {string} author - Name above the message
 * @param {string | null} [avatarUrl] - Portrait beside it
 * @param {string} [time] - Stamp beside the name
 * @param {boolean} [disabled] - Blocks editing
 * @param {number} [maxLength] - Longest message
 * @param {(editing: boolean) => void} [onEditingChange] - Bar opened or closed
 * @param {(value: string) => Promise<boolean>} onCommit - Persists the new text
 * @return {JSX.Element}
 */

export const InlineAnnouncement = ({
  id,
  value,
  mentions,
  author,
  avatarUrl,
  time,
  disabled,
  maxLength,
  onEditingChange,
  onCommit,
}: InlineAnnouncementProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const bar = useRef<HTMLDivElement>(null)

  // The bar takes the caret as it opens
  useEffect(() => {
    if (editing) bar.current?.querySelector('textarea')?.focus()
  }, [editing])

  useEffect(() => onEditingChange?.(editing), [editing, onEditingChange])

  const start = () => {
    if (disabled) return
    setDraft(value)
    setEditing(true)
  }

  const commit = async () => {
    if (draft === value || (await onCommit(draft))) setEditing(false)
  }

  // Blur outside the bar saves
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    void commit()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    setEditing(false)
  }

  return (
    <div
      role={disabled || editing ? undefined : 'button'}
      tabIndex={disabled || editing ? undefined : 0}
      className={cn(!disabled && 'cursor-text')}
      onClick={editing ? undefined : start}
      onKeyDown={(event) => !editing && event.key === 'Enter' && start()}
    >
      <DiscordMessage
        source={editing ? draft : value}
        mentions={mentionChoices(mentions)}
        author={author}
        avatarUrl={avatarUrl}
        time={time}
        editor={
          editing ? (
            <div ref={bar} onBlur={onBlur} onKeyDown={onKeyDown}>
              <DiscordComposer
                id={id}
                value={draft}
                options={mentions}
                maxLength={maxLength}
                onChange={setDraft}
                inline
              />
            </div>
          ) : undefined
        }
      />
    </div>
  )
}
