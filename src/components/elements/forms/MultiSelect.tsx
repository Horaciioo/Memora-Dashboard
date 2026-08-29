'use client'

import { useId, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { OptionMark } from '@/components/elements/forms/OptionMark'
import { useAnchoredPanel } from '@/core/hooks/interaction/useAnchoredPanel'
import { PICKER_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SELECT_MENU_STYLES, TAGS_STYLES, TOGGLE_STYLES } from '@/declarations/ui/variants'
import { useHints } from '@/managers/front-end'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface MultiSelectProps {
  id: string
  options: FieldOption[]
  value: string[]
  onChange: (value: string[]) => void
  // Names the control for assistive technology
  label: string
  // Shown while nothing is chosen, and when no option exists yet
  emptyLabel: string
  mark?: OptionMarkKind
  maxItems?: number
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Narrowest the panel ever gets, whatever the trigger measures
const MIN_PANEL_WIDTH = 200

// Option count above which the panel gains its own filter field
const SEARCH_THRESHOLD = 8

/**
 * Collapsed multi-select — its trigger carries the chosen entries as tags, its panel a
 * filterable checklist that stays open while entries are toggled
 * @param {string} id - Identifier of the trigger
 * @param {FieldOption[]} options - Selectable options
 * @param {string[]} value - Selected values
 * @param {(value: string[]) => void} onChange - Selection handler
 * @param {string} label - Accessible name of the control
 * @param {string} emptyLabel - Placeholder and empty-options text
 * @param {OptionMarkKind} [mark] - Glyph drawn beside every option
 * @param {number} [maxItems] - Most entries allowed
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the message describing the control
 * @return {JSX.Element}
 */

export const MultiSelect = ({
  id,
  options,
  value,
  onChange,
  label,
  emptyLabel,
  mark,
  maxItems,
  disabled,
  invalid,
  describedBy,
}: MultiSelectProps) => {
  const [query, setQuery] = useState('')
  const listId = useId()
  const { isOpen, setOpen, open, close, triggerRef, panelRef } = useAnchoredPanel({
    matchTriggerWidth: true,
    minWidth: MIN_PANEL_WIDTH,
  })
  const { showHint } = useHints()

  const CheckIcon = ICONS.confirm
  const ChevronIcon = ICONS.expand

  const hasSearch = options.length > SEARCH_THRESHOLD
  const selected = options.filter((option) => value.includes(option.value))
  const atLimit = maxItems !== undefined && value.length >= maxItems

  const matching = useMemo(() => {
    const term = query.trim().toLowerCase()

    return term ? options.filter((option) => option.label.toLowerCase().includes(term)) : options
  }, [options, query])

  const openPanel = () => {
    if (disabled) return

    setQuery('')
    open()
  }

  // Toggle an option, explaining a blocked one where it was clicked
  const toggle = (option: FieldOption, origin: { x: number; y: number }) => {
    if (option.disabled) {
      if (option.hint) showHint(option.hint, origin, ICONS.blocked)
      return
    }

    if (value.includes(option.value)) {
      onChange(value.filter((entry) => entry !== option.value))
      return
    }

    if (atLimit) return

    onChange([...value, option.value])
  }

  if (options.length === 0) {
    return <p className="text-sm text-[var(--color-ink-subtle)] italic">{emptyLabel}</p>
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
        onClick={() => (isOpen ? setOpen(false) : openPanel())}
        className={cn(
          SELECT_MENU_STYLES.trigger,
          SELECT_MENU_STYLES.triggerBlock,
          invalid && SELECT_MENU_STYLES.invalid
        )}
      >
        {selected.length > 0 ? (
          <span className={SELECT_MENU_STYLES.tags}>
            {selected.map((option) => (
              <span key={option.value} className={TAGS_STYLES.tag}>
                {mark && <OptionMark mark={mark} option={option} />}
                {option.label}
              </span>
            ))}
          </span>
        ) : (
          <span className={SELECT_MENU_STYLES.placeholder}>{emptyLabel}</span>
        )}
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
            aria-multiselectable="true"
            aria-label={label}
            className={SELECT_MENU_STYLES.panel}
          >
            {hasSearch && (
              <input
                autoFocus
                value={query}
                placeholder={PICKER_COPY.searchOption}
                aria-label={PICKER_COPY.searchOption}
                className={SELECT_MENU_STYLES.search}
                onChange={(event) => setQuery(event.target.value)}
              />
            )}
            <div className={SELECT_MENU_STYLES.list}>
              {matching.length === 0 && (
                <p className={SELECT_MENU_STYLES.empty}>{PICKER_COPY.noOption}</p>
              )}
              {matching.map((option) => {
                const isSelected = value.includes(option.value)
                const blocked = option.disabled || (atLimit && !isSelected)

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={blocked || undefined}
                    onClick={(event: MouseEvent<HTMLButtonElement>) =>
                      toggle(option, { x: event.clientX, y: event.clientY })
                    }
                    className={cn(
                      SELECT_MENU_STYLES.option,
                      isSelected && SELECT_MENU_STYLES.optionSelected,
                      blocked && 'cursor-not-allowed opacity-40'
                    )}
                  >
                    <span
                      className={cn(TOGGLE_STYLES.checkbox, isSelected && TOGGLE_STYLES.checkboxOn)}
                      aria-hidden="true"
                    >
                      {isSelected && <CheckIcon className="h-3 w-3" />}
                    </span>
                    {mark && <OptionMark mark={mark} option={option} />}
                    <span className={SELECT_MENU_STYLES.optionLabel}>{option.label}</span>
                    {option.hint && (
                      <span className={SELECT_MENU_STYLES.optionHint}>{option.hint}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
