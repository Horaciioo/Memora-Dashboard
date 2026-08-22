'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearch } from '@/core/hooks/data/useSearch'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { PALETTE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { SearchHit } from '@/types/search'

export interface CommandPaletteProps {
  onClose: () => void
}

/**
 * Overlay searching every resource at once, driven by the keyboard — mounted only while
 * open, so its term and its cursor reset on their own
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element | null}
 */

export const CommandPalette = ({ onClose }: CommandPaletteProps) => {
  const router = useRouter()
  const [term, setTerm] = useState('')
  const [pointer, setPointer] = useState({ term: '', cursor: 0 })
  const { sections, isLoading } = useSearch(term)
  const containerRef = useFocusTrap(true, onClose)
  useScrollLock(true)

  // Flatten the sections so the cursor walks a single list
  const hits = useMemo(() => sections.flatMap((section) => section.hits), [sections])

  // A new term always sends the cursor back to the first hit
  if (pointer.term !== term) setPointer({ term, cursor: 0 })

  const cursor = pointer.cursor
  const setCursor = (next: number) => setPointer({ term, cursor: next })

  if (typeof document === 'undefined') return null

  const openHit = (hit: SearchHit) => {
    onClose()
    router.push(hit.href)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (hits.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((cursor + 1) % hits.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((cursor - 1 + hits.length) % hits.length)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      openHit(hits[cursor])
    }
  }

  const SearchIcon = ICONS.search
  const isTooShort = term.trim().length < SEARCH_SETTINGS.minLength

  return createPortal(
    <div
      className={PALETTE_STYLES.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={NAV_COPY.searchTitle}
        className={PALETTE_STYLES.panel}
      >
        <div className={PALETTE_STYLES.field}>
          <SearchIcon className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={NAV_COPY.searchPlaceholder}
            aria-label={NAV_COPY.searchTitle}
            className={PALETTE_STYLES.input}
          />
        </div>
        <div className={PALETTE_STYLES.results}>
          {isTooShort && <p className="px-4 py-6 text-sm text-[var(--color-ink-subtle)]">{NAV_COPY.searchPrompt}</p>}
          {!isTooShort && !isLoading && hits.length === 0 && (
            <p className="px-4 py-6 text-sm text-[var(--color-ink-subtle)]">{NAV_COPY.searchEmpty}</p>
          )}
          {sections.map((section) => (
            <div key={section.group}>
              <p className={PALETTE_STYLES.group}>{section.label}</p>
              {section.hits.map((hit) => {
                const index = hits.indexOf(hit)

                return (
                  <button
                    key={`${hit.group}-${hit.id}`}
                    type="button"
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => openHit(hit)}
                    className={cn(
                      PALETTE_STYLES.result,
                      index === cursor && PALETTE_STYLES.resultActive
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{hit.label}</span>
                    {hit.hint && (
                      <span className="shrink-0 text-xs text-[var(--color-ink-subtle)]">
                        {hit.hint}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className={PALETTE_STYLES.hint}>
          <span>{NAV_COPY.searchNavigate}</span>
          <span>{NAV_COPY.searchShortcut}</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
