'use client'

import { useEffect, useState } from 'react'
import { CommandPalette } from '@/composites/search/CommandPalette'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'

export interface SearchLauncherProps {
  // Bare glyph button instead of the full trigger
  iconOnly?: boolean
  // Classes for the bare glyph button, ignored without iconOnly
  className?: string
}

/**
 * Trigger of the command palette
 * @param {boolean} [iconOnly] - Renders a bare glyph button instead of the full trigger
 * @param {string} [className] - Classes for the bare glyph button
 * @return {JSX.Element}
 */

export const SearchLauncher = ({ iconOnly, className }: SearchLauncherProps = {}) => {
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
      {iconOnly ? (
        <button
          type="button"
          aria-label={NAV_COPY.searchTitle}
          onClick={() => setOpen(true)}
          className={className}
        >
          <SearchIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={APP_SHELL.searchTrigger}>
          <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{NAV_COPY.searchPlaceholder}</span>
          <span className={APP_SHELL.searchHint}>{NAV_COPY.searchShortcut}</span>
        </button>
      )}
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  )
}
