'use client'

import { useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Avatar } from '@/components/elements/display/Avatar'
import { BROADCAST_MENTIONS } from '@/declarations/discord/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { MentionEntry } from '@/utils/format/discord'
import { toDisplay, toRaw } from '@/utils/format/discord'
import { caretSpot } from '@/utils/format/caret'
import { foldText } from '@/utils/format/strings'

// Menu footprint, width and the room it needs
const MENU_WIDTH = 288
const MENU_ROOM = 232
const MENU_GAP = 10
const MENU_EDGE = 8
// Arrow stays clear of the menu corners
const ARROW_EDGE = 20

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

// Framed pane of the form
const Frame = ({ children }: { children: ReactNode }) => (
  <div className={cn(DISCORD_MESSAGE.frame, DISCORD_MESSAGE.pane)}>{children}</div>
)

export interface DiscordComposerProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: FieldOption[]
  disabled?: boolean
  maxLength?: number
  // Drawn over the message it edits, without frame
  inline?: boolean
}

/**
 * Announcement written in Discord's message bar, mentions picked by typing @ or #
 * @param {string} id - Field identifier
 * @param {string} value - Markdown
 * @param {(value: string) => void} onChange - Markdown handler
 * @param {FieldOption[]} options - Members
 * @param {boolean} [disabled] - Blocks the bar
 * @param {number} [maxLength] - Longest message
 * @param {boolean} [inline] - Bare bar standing in for a message
 * @return {JSX.Element}
 */

export const DiscordComposer = ({
  id,
  value,
  onChange,
  options,
  disabled,
  maxLength,
  inline,
}: DiscordComposerProps) => {
  const input = useRef<HTMLTextAreaElement>(null)
  const choices = useMemo(() => mentionChoices(options), [options])
  const [query, setQuery] = useState<{
    sigil: string
    text: string
    start: number
    menu: { style: CSSProperties; arrow: number; above: boolean }
  } | null>(null)
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
  const readQuery = (field: HTMLTextAreaElement) => {
    const caret = field.selectionStart
    const match = QUERY_PATTERN.exec(field.value.slice(0, caret))
    if (!match) return setQuery(null)

    const start = caret - (match[3]?.length ?? 0) - 1
    const spot = caretSpot(field, start)
    // The arrow aims at the middle of the sigil
    const centre = (spot.left + caretSpot(field, start + 1).left) / 2
    // Opens under the sigil, above it when the screen runs out below
    const spaceBelow = window.innerHeight - spot.top - spot.height
    const above = spaceBelow < MENU_ROOM && spot.top > spaceBelow
    const left = Math.min(
      Math.max(centre - ARROW_EDGE, MENU_EDGE),
      window.innerWidth - MENU_WIDTH - MENU_EDGE
    )

    setActive(0)
    setQuery({
      sigil: match[2] ?? '@',
      text: match[3] ?? '',
      start,
      menu: {
        above,
        arrow: centre - left,
        style: {
          left,
          ...(above
            ? { bottom: window.innerHeight - spot.top + MENU_GAP }
            : { top: spot.top + spot.height + MENU_GAP }),
        },
      },
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

  const Shell = inline ? 'div' : Frame

  return (
    <Shell>
      <div className={inline ? 'relative' : DISCORD_MESSAGE.composer}>
        {query &&
          createPortal(
            <div
              className={DISCORD_MESSAGE.menu}
              style={query.menu.style}
              role="listbox"
              aria-labelledby={id}
            >
              <span
                aria-hidden="true"
                className={cn(
                  DISCORD_MESSAGE.menuArrow,
                  query.menu.above ? DISCORD_MESSAGE.menuArrowBelow : DISCORD_MESSAGE.menuArrowAbove
                )}
                style={{ left: query.menu.arrow }}
              />
              <div className={DISCORD_MESSAGE.popover}>
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
                            <Avatar
                              name={choice.option.label}
                              src={choice.option.image}
                              size="xs"
                            />
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
            </div>,
            document.body
          )}
        <textarea
          id={id}
          ref={input}
          className={inline ? DISCORD_MESSAGE.inlineInput : DISCORD_MESSAGE.input}
          value={display}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={WORK_DISCORD_COPY.placeholder}
          onChange={(event) => {
            onChange(toRaw(event.target.value, choices))
            readQuery(event.target)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setQuery(null)}
        />
        {!inline && <p className={DISCORD_MESSAGE.hint}>{WORK_DISCORD_COPY.mentionHint}</p>}
      </div>
    </Shell>
  )
}
