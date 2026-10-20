'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/inputs/Textarea'
import { useMentionable } from '@/core/hooks/data/system/useMentionable'
import { ACTION_COPY, COMMENT_COPY } from '@/declarations/ui/copy'
import { COMMENT_COMPOSER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatMention } from '@/utils/format/mentions'

// Handle being typed right before the caret, a bare at sign included, up to two words
const QUERY_PATTERN = /(^|\s)@([\p{L}\p{N}._-]*(?:\s[\p{L}\p{N}._-]*)?)$/u

export interface CommentComposerProps {
  maxLength?: number
  isSaving: boolean
  // Rejection of the body
  error?: string
  onSubmit: (body: string) => Promise<boolean>
  onCancel: () => void
}

/**
 * Plain text area opened under a thread: markdown as written, members mentioned by typing @
 * @param {number} [maxLength] - Longest remark
 * @param {boolean} isSaving - Request in flight
 * @param {string} [error] - Rejection of the body
 * @param {(body: string) => Promise<boolean>} onSubmit - Leaves the remark
 * @param {() => void} onCancel - Closes the area
 * @return {JSX.Element}
 */

export const CommentComposer = ({
  maxLength,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  const input = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [query, setQuery] = useState<{ text: string; start: number } | null>(null)
  const [active, setActive] = useState(0)

  const matches = useMentionable(query ? query.text : null)

  // A second word that names nobody is plain prose
  const isOpen = query !== null && (matches.length > 0 || !query.text.includes(' '))

  const readQuery = (text: string, caret: number) => {
    const match = QUERY_PATTERN.exec(text.slice(0, caret))
    if (!match) return setQuery(null)

    setActive(0)
    setQuery({ text: match[2] ?? '', start: caret - (match[2]?.length ?? 0) - 1 })
  }

  const pick = (name: string) => {
    const node = input.current
    if (!node || !query) return

    const caret = node.selectionStart
    const handle = formatMention(name)
    setBody(`${body.slice(0, query.start)}${handle} ${body.slice(caret)}`)
    setQuery(null)

    const position = query.start + handle.length + 1
    requestAnimationFrame(() => {
      node.focus()
      node.setSelectionRange(position, position)
    })
  }

  const submit = async () => {
    if (body.trim().length === 0 || isSaving) return
    if (await onSubmit(body.trim())) setBody('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isOpen && matches.length > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActive((current) => (current + step + matches.length) % matches.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const hit = matches[active]
        if (hit) pick(hit.name)
        return
      }
    }

    if (event.key === 'Escape') {
      event.stopPropagation()
      if (isOpen) setQuery(null)
      else onCancel()
    }
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <div className={COMMENT_COMPOSER.wrapper}>
      {isOpen && (
        <div className={COMMENT_COMPOSER.popover} role="listbox">
          {matches.length === 0 ? (
            <p className={COMMENT_COMPOSER.empty}>{COMMENT_COPY.noMention}</p>
          ) : (
            matches.map((hit, index) => (
              <button
                key={hit.id}
                type="button"
                role="option"
                aria-selected={index === active}
                className={cn(
                  COMMENT_COMPOSER.item,
                  index === active && COMMENT_COMPOSER.itemActive
                )}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => {
                  event.preventDefault()
                  pick(hit.name)
                }}
              >
                <Avatar name={hit.name} src={hit.image} size="xs" />
                <span className="truncate">{hit.name}</span>
                {hit.hint && <span className={COMMENT_COMPOSER.itemHint}>{hit.hint}</span>}
              </button>
            ))
          )}
        </div>
      )}
      <Textarea
        ref={input}
        autoFocus
        value={body}
        maxLength={maxLength}
        invalid={Boolean(error)}
        placeholder={COMMENT_COPY.placeholder}
        aria-label={COMMENT_COPY.field}
        className={COMMENT_COMPOSER.input}
        onChange={(event) => {
          setBody(event.target.value)
          readQuery(event.target.value, event.target.selectionStart)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setQuery(null)}
      />
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      <div className={COMMENT_COMPOSER.actions}>
        <span className={COMMENT_COMPOSER.hint}>{COMMENT_COPY.hint}</span>
        <span className="flex gap-2">
          <Button onClick={onCancel} disabled={isSaving}>
            {ACTION_COPY.cancel}
          </Button>
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={isSaving || body.trim().length === 0}
          >
            {COMMENT_COPY.publish}
          </Button>
        </span>
      </div>
    </div>
  )
}
