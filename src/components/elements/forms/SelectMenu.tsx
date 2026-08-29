'use client'

import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { OptionMark } from '@/components/elements/forms/OptionMark'
import { useAnchoredPanel } from '@/core/hooks/interaction/useAnchoredPanel'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SELECT_MENU_STYLES } from '@/declarations/ui/variants'
import { useHints } from '@/managers/front-end'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface SelectMenuProps {
  id?: string
  options: FieldOption[]
  value: string
  onChange: (value: string) => void
  // Names the control for assistive technology
  label: string
  // First entry of the list, clearing the current choice
  emptyLabel?: string
  placeholder?: string
  mark?: OptionMarkKind
  compact?: boolean
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  className?: string
}

// Narrowest the panel ever gets, whatever the trigger measures
const MIN_PANEL_WIDTH = 200

// Option count above which the panel gains its own filter field
const SEARCH_THRESHOLD = 8

/**
 * Drawn dropdown replacing the native select, each option carrying the glyph its field
 * declared — a colour dot, a portrait, or the priority marks
 * @param {string} [id] - Identifier of the trigger
 * @param {FieldOption[]} options - Selectable options
 * @param {string} value - Selected value
 * @param {(value: string) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the control
 * @param {string} [emptyLabel] - Label of the clearing entry
 * @param {string} [placeholder] - Text shown while nothing is chosen
 * @param {OptionMarkKind} [mark] - Glyph drawn beside every option
 * @param {boolean} [compact] - Shrinks the trigger to toolbar height
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the message describing the control
 * @param {string} [className] - Extra classes merged onto the trigger
 * @return {JSX.Element}
 */

export const SelectMenu = ({
  id,
  options,
  value,
  onChange,
  label,
  emptyLabel,
  placeholder,
  mark,
  compact,
  disabled,
  invalid,
  describedBy,
  className,
}: SelectMenuProps) => {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const activeRef = useRef<HTMLButtonElement | null>(null)

  const { isOpen, setOpen, close, triggerRef, panelRef } = useAnchoredPanel({
    matchTriggerWidth: true,
    minWidth: MIN_PANEL_WIDTH,
  })

  const { showHint } = useHints()

  const ChevronIcon = ICONS.expand
  const CheckIcon = ICONS.confirm

  const selected = options.find((option) => option.value === value) ?? null
  const hasSearch = options.length > SEARCH_THRESHOLD

  // The clearing entry rides in the same list, so one index walks everything
  const entries = useMemo(() => {
    const term = query.trim().toLowerCase()
    const matching = term
      ? options.filter((option) => option.label.toLowerCase().includes(term))
      : options

    return emptyLabel !== undefined
      ? [{ value: '', label: emptyLabel } satisfies FieldOption, ...matching]
      : matching
  }, [options, query, emptyLabel])

  // Reopening always lands on the current choice
  const open = () => {
    if (disabled) return

    const index = entries.findIndex((entry) => entry.value === value)
    setQuery('')
    setActiveIndex(index < 0 ? 0 : index)
    setOpen(true)
  }

  const choose = (next: string) => {
    onChange(next)
    close()
  }

  // An unselectable option still explains itself, right where it was clicked
  const explainDisabled = (entry: FieldOption, origin: { x: number; y: number }) => {
    if (entry.hint) showHint(entry.hint, origin, ICONS.blocked)
  }

  // Keys are read on the panel, so it takes focus unless a filter field owns it
  useEffect(() => {
    if (!isOpen || hasSearch) return

    panelRef.current?.focus()
  }, [isOpen, hasSearch, panelRef])

  // Walking the list with the keyboard scrolls it along
  useEffect(() => {
    if (!isOpen) return

    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && entries[activeIndex]) {
      event.preventDefault()

      const entry = entries[activeIndex]
      if (entry.disabled) {
        const rect = activeRef.current?.getBoundingClientRect()
        if (rect) explainDisabled(entry, { x: rect.left + rect.width / 2, y: rect.top })
        return
      }

      choose(entry.value)
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    // Walking past either end wraps around rather than sticking
    event.preventDefault()
    setActiveIndex((current) => {
      const step = event.key === 'ArrowDown' ? 1 : -1

      return (current + step + entries.length) % Math.max(entries.length, 1)
    })
  }

  return (
    <>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onClick={() => (isOpen ? setOpen(false) : open())}
        onKeyDown={(event) => {
          if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
            event.preventDefault()
            open()
          }
        }}
        className={cn(
          SELECT_MENU_STYLES.trigger,
          compact ? SELECT_MENU_STYLES.triggerCompact : SELECT_MENU_STYLES.triggerBlock,
          invalid && SELECT_MENU_STYLES.invalid,
          className
        )}
      >
        <span className={SELECT_MENU_STYLES.value}>
          {selected ? (
            <>
              {mark && <OptionMark mark={mark} option={selected} />}
              <span className={SELECT_MENU_STYLES.optionLabel}>{selected.label}</span>
            </>
          ) : (
            <span className={SELECT_MENU_STYLES.placeholder}>
              {placeholder ?? emptyLabel ?? PICKER_COPY.choose}
            </span>
          )}
        </span>
        <ChevronIcon
          className={cn(SELECT_MENU_STYLES.chevron, isOpen && SELECT_MENU_STYLES.chevronOpen)}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[65]" role="presentation" onMouseDown={close} />
          <div
            ref={panelRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            className={SELECT_MENU_STYLES.panel}
            onKeyDown={onKeyDown}
          >
            {hasSearch && (
              <input
                autoFocus
                value={query}
                placeholder={PICKER_COPY.searchOption}
                aria-label={PICKER_COPY.searchOption}
                className={SELECT_MENU_STYLES.search}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
              />
            )}
            <div className={SELECT_MENU_STYLES.list}>
              {entries.length === 0 && (
                <p className={SELECT_MENU_STYLES.empty}>{PICKER_COPY.noOption}</p>
              )}
              {entries.map((entry, index) => {
                const isSelected = entry.value === value
                const isClearing = emptyLabel !== undefined && index === 0

                return (
                  <Fragment key={entry.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={entry.disabled || undefined}
                      ref={index === activeIndex ? activeRef : undefined}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={(event: MouseEvent<HTMLButtonElement>) =>
                        entry.disabled
                          ? explainDisabled(entry, { x: event.clientX, y: event.clientY })
                          : choose(entry.value)
                      }
                      className={cn(
                        SELECT_MENU_STYLES.option,
                        index === activeIndex && SELECT_MENU_STYLES.optionActive,
                        isSelected && SELECT_MENU_STYLES.optionSelected,
                        entry.disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {mark && entry.value !== '' && <OptionMark mark={mark} option={entry} />}
                      <span className={SELECT_MENU_STYLES.optionLabel}>{entry.label}</span>
                      {entry.hint && (
                        <span className={SELECT_MENU_STYLES.optionHint}>{entry.hint}</span>
                      )}
                      {isSelected && (
                        <CheckIcon className={SELECT_MENU_STYLES.check} aria-hidden="true" />
                      )}
                    </button>
                    {isClearing && entries.length > 1 && (
                      <div className={SELECT_MENU_STYLES.divider} aria-hidden="true" />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
