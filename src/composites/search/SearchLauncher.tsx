'use client'

import { useEffect, useState } from 'react'
import { CommandPalette } from '@/composites/search/CommandPalette'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SearchLauncherProps {
  // Overrides the standard glyph button, e.g. the dark round button of the mobile shell
  className?: string
  iconClassName?: string
}

/**
 * Glyph opening the command palette, which the keyboard also reaches on its own
 * @param {string} [className] - Classes overriding the standard glyph button
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @return {JSX.Element}
 */

export const SearchLauncher = ({ className, iconClassName }: SearchLauncherProps = {}) => {
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
        className={className ?? cn(BUTTON_STYLES.base, BUTTON_STYLES.icon)}
      >
        <SearchIcon className={iconClassName ?? 'h-4 w-4 shrink-0'} aria-hidden="true" />
      </button>
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  )
}
