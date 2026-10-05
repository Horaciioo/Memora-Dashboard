'use client'

import { useEffect, useState } from 'react'
import { CommandPalette } from '@/composites/search/CommandPalette'
import { SEARCH_LAUNCHER } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SearchLauncherProps {
  // Overrides the standard glyph button
  className?: string
  iconClassName?: string
  // Full bar variant
  expanded?: boolean
}

/**
 * Glyph opening the command palette
 * @param {string} [className] - Classes overriding the standard glyph button
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @param {boolean} [expanded] - Renders the full bar
 * @return {JSX.Element}
 */

export const SearchLauncher = ({
  className,
  iconClassName,
  expanded,
}: SearchLauncherProps = {}) => {
  const [isOpen, setOpen] = useState(false)
  const SearchIcon = ICONS.search

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Cmd or Ctrl plus K opens the palette from anywhere
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return

      event.preventDefault()
      setOpen((open) => !open)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label={NAV_COPY.searchTitle}
        title={`${NAV_COPY.searchTitle} · ${NAV_COPY.searchShortcut}`}
        onClick={() => setOpen(true)}
        className={
          className ?? cn(BUTTON_STYLES.base, expanded ? SEARCH_LAUNCHER.bar : BUTTON_STYLES.icon)
        }
      >
        <SearchIcon className={iconClassName ?? 'h-4 w-4 shrink-0'} aria-hidden="true" />
        {expanded && (
          <>
            <span className={SEARCH_LAUNCHER.barLabel}>{NAV_COPY.searchPlaceholder}</span>
            <kbd className={SEARCH_LAUNCHER.barShortcut}>{NAV_COPY.searchShortcut}</kbd>
          </>
        )}
      </button>
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  )
}
