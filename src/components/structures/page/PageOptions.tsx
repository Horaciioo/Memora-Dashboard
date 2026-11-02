'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { PageOptionsList } from '@/components/structures/page/PageOptionsList'
import { useBannerHost } from '@/core/hooks/interaction/layout/useBannerHost'
import { PAGE_OPTIONS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_OPTIONS_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PAGE_OPTIONS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

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

export interface PageContent {
  id: string
  label: string
  // Free content, drawn on a phone only
  render: () => ReactNode
}

export interface PageNote {
  id: string
  label: string
  // Read-only line, every screen
  text: string
}

export interface PageProfile {
  id: string
  // Person shown with their avatar
  name: string
  image: string | null
  // Small lines under the name
  lines: string[]
}

export interface PageAction {
  id: string
  label: string
  icon?: IconName
  danger?: boolean
  onSelect: () => void
}

// Heading shared by the options that follow it, a divider alone when it carries no heading
export interface PageSectioned {
  section?: string
  // Rule between two groups, no heading
  group?: string
}

// A yes/no switch, one pick among a few, a whole block, a note, a profile, or a single gesture
export type PageOption = (
  PageToggle | PageChoice | PageContent | PageNote | PageProfile | PageAction
) &
  PageSectioned

export interface PageOptionsProps {
  options: PageOption[]
  // Panel heading, the display one by default
  title?: string
}

/**
 * Round button in the top right of the page banner
 * @param {PageOption[]} options - One switch per row
 * @param {string} [title] - Panel heading
 * @return {JSX.Element | null}
 */

export const PageOptions = ({ options, title = PAGE_OPTIONS_COPY.title }: PageOptionsProps) => {
  const host = useBannerHost(PAGE_OPTIONS_HOST_ID)
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
        <div className={PAGE_OPTIONS.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />
      )}

      {isOpen && (
        <div role="group" aria-label={title} className={PAGE_OPTIONS.panel}>
          <p className={PAGE_OPTIONS.title}>{title}</p>
          <PageOptionsList options={options} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>,
    host
  )
}
