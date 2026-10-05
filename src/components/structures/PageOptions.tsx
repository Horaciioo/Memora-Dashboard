'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { Toggle } from '@/components/elements/forms/Toggle'
import { PAGE_OPTIONS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_OPTIONS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// The slot never changes once the banner is mounted
const subscribeNothing = () => () => undefined

const readHost = (): HTMLElement | null => document.getElementById(PAGE_OPTIONS_HOST_ID)

export interface PageToggle {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export interface PageChoice<TValue extends string = string> {
  id: string
  label: string
  value: TValue
  choices: { value: TValue; label: string }[]
  onChange: (value: TValue) => void
}

// A yes/no switch or one pick among a few
export type PageOption = PageToggle | PageChoice

export interface PageOptionsProps {
  options: PageOption[]
}

/**
 * Round button in the top right of the page banner
 * @param {PageOption[]} options - One switch per row
 * @return {JSX.Element | null}
 */

export const PageOptions = ({ options }: PageOptionsProps) => {
  const host = useSyncExternalStore(subscribeNothing, readHost, () => null)
  const [isOpen, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const MoreIcon = ICONS.more

  useEffect(() => {
    if (!isOpen) return

    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      if (event instanceof PointerEvent && rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)

    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [isOpen])

  if (!host || options.length === 0) return null

  return createPortal(
    <div ref={rootRef} className={PAGE_OPTIONS.host}>
      <button
        type="button"
        aria-label={PAGE_OPTIONS_COPY.label}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(PAGE_OPTIONS.button, isOpen && PAGE_OPTIONS.buttonOpen)}
        onClick={() => setOpen(!isOpen)}
      >
        <MoreIcon className={PAGE_OPTIONS.icon} aria-hidden="true" />
      </button>

      {isOpen && (
        <div role="group" aria-label={PAGE_OPTIONS_COPY.title} className={PAGE_OPTIONS.panel}>
          <p className={PAGE_OPTIONS.title}>{PAGE_OPTIONS_COPY.title}</p>
          {options.map((option) => (
            <div
              key={option.id}
              className={cn(
                PAGE_OPTIONS.row,
                'choices' in option && option.choices.length > 2 && PAGE_OPTIONS.rowStacked
              )}
            >
              <span>{option.label}</span>
              {'choices' in option ? (
                <SegmentedControl
                  options={option.choices}
                  value={option.value}
                  onChange={option.onChange}
                  label={option.label}
                />
              ) : (
                <Toggle
                  bare
                  label={option.label}
                  checked={option.checked}
                  onChange={option.onChange}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>,
    host
  )
}
