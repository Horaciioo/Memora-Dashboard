'use client'

import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { BROADCAST_MENTIONS } from '@/declarations/discord/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { MentionEntry } from '@/utils/format/discord'
import { toDisplay, toRaw } from '@/utils/format/discord'
import { foldText } from '@/utils/format/strings'

// Longest name a mention query may run over
const QUERY_MAX = 32

// A sigil and the name typed after it
const QUERY_PATTERN = new RegExp(`(^|\\s)([@#])([^\\n@#]{0,${QUERY_MAX}})$`, 'u')

/**
 * Mention offered while typing
 * @typedef {Object} MentionChoice
 * @property {string} token - Token Discord reads
 * @property {string} display - What the writer types
 * @property {FieldOption | null} option - Directory entry
 */

interface MentionChoice extends MentionEntry {
  option: FieldOption | null
}

/**
 * Turn the directory into mention choices
 * @param {FieldOption[]} options - Members
 * @return {MentionChoice[]} - Choices
 */

export const mentionChoices = (options: FieldOption[]): MentionChoice[] => [
  ...options.map((option) => ({
    token: option.value,
    display: `${option.value.startsWith('<#') ? '#' : '@'}${option.label}`,
    option,
  })),
  ...BROADCAST_MENTIONS.map((token) => ({ token, display: token, option: null })),
]

export interface DiscordComposerProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: FieldOption[]
  author: string
  disabled?: boolean
  maxLength?: number
}

/**
 * Announcement written the way Discord writes it: the message bar at the bottom, the rendered
 * message above it as it will read in the channel, mentions picked by typing @ or #
 * @param {string} id - Field identifier
 * @param {string} value - Markdown
 * @param {(value: string) => void} onChange - Markdown handler
 * @param {FieldOption[]} options - Members
 * @param {string} author - Name the preview is signed with
 * @param {boolean} [disabled] - Blocks the bar
 * @param {number} [maxLength] - Longest message
 * @return {JSX.Element}
 */

export const DiscordComposer = ({
  id,
  value,
  onChange,
  options,
  author,
  disabled,
  maxLength,
}: DiscordComposerProps) => {
  const input = useRef<HTMLTextAreaElement>(null)
  const choices = useMemo(() => mentionChoices(options), [options])
  const [query, setQuery] = useState<{ sigil: string; text: string; start: number } | null>(null)
  const [active, setActive] = useState(0)

  const display = toDisplay(value, choices)

  // Choices under the query
  const matches = useMemo(() => {
    if (!query) return []
    const needle = foldText(query.text)

    return choices.filter(
      (choice) =>
        choice.display.startsWith(query.sigil) && foldText(choice.display.slice(1)).includes(needle)
    )
  }, [choices, query])

  // Read the mention being typed right before the caret
  const readQuery = (text: string, caret: number) => {
    const match = QUERY_PATTERN.exec(text.slice(0, caret))
    if (!match) return setQuery(null)

    setActive(0)
    setQuery({
      sigil: match[2] ?? '@',
      text: match[3] ?? '',
      start: caret - (match[3]?.length ?? 0) - 1,
    })
  }

  const pick = (choice: MentionChoice) => {
    const node = input.current
    if (!node || !query) return

    const caret = node.selectionStart
    const next = `${display.slice(0, query.start)}${choice.display} ${display.slice(caret)}`
    onChange(toRaw(next, choices))
    setQuery(null)

    // Caret lands right after the inserted mention
    const position = query.start + choice.display.length + 1
    requestAnimationFrame(() => {
      node.focus()
      node.setSelectionRange(position, position)
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!query || matches.length === 0) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + matches.length) % matches.length)
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const choice = matches[active]
      if (choice) pick(choice)
    } else if (event.key === 'Escape') {
      setQuery(null)
    }
  }

  // Headings of the suggestion list
  let lastGroup: string | null = null

  return (
    <div className={DISCORD_MESSAGE.frame}>
      <DiscordMessage source={value} mentions={choices} author={author} />

      <div className={DISCORD_MESSAGE.composer}>
        {query && (
          <div className={DISCORD_MESSAGE.popover} role="listbox" aria-labelledby={id}>
            {matches.length === 0 ? (
              <p className={DISCORD_MESSAGE.popoverEmpty}>{WORK_DISCORD_COPY.noMatch}</p>
            ) : (
              matches.map((choice, index) => {
                const group = choice.option?.group ?? WORK_DISCORD_COPY.broadcastGroup
                const heading = group !== lastGroup ? group : null
                lastGroup = group
                const paint = accentPaint(choice.option?.accent)

                return (
                  <div key={choice.token}>
                    {heading && <p className={DISCORD_MESSAGE.popoverGroup}>{heading}</p>}
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      className={cn(
                        DISCORD_MESSAGE.popoverItem,
                        index === active && DISCORD_MESSAGE.popoverItemActive
                      )}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        pick(choice)
                      }}
                    >
                      {choice.option?.image !== undefined ? (
                        <Avatar name={choice.option.label} src={choice.option.image} size="xs" />
                      ) : choice.option?.accent ? (
                        <span
                          className={cn(DISCORD_MESSAGE.roleDot, paint.dot)}
                          style={paint.style}
                        />
                      ) : null}
                      {choice.display}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
        <textarea
          id={id}
          ref={input}
          rows={3}
          className={DISCORD_MESSAGE.input}
          value={display}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={WORK_DISCORD_COPY.placeholder}
          onChange={(event) => {
            onChange(toRaw(event.target.value, choices))
            readQuery(event.target.value, event.target.selectionStart)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setQuery(null)}
        />
        <p className={DISCORD_MESSAGE.hint}>{WORK_DISCORD_COPY.mentionHint}</p>
      </div>
    </div>
  )
}
