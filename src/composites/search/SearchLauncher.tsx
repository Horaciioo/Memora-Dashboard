'use client'

import { useEffect, useState } from 'react'
import { CommandPalette } from '@/composites/search/CommandPalette'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'

/**
 * Topbar trigger of the command palette, also bound to the keyboard shortcut
 * @return {JSX.Element}
 */

export const SearchLauncher = () => {
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
      <button type="button" onClick={() => setOpen(true)} className={APP_SHELL.searchTrigger}>
        <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{NAV_COPY.searchPlaceholder}</span>
        <span className={APP_SHELL.searchHint}>{NAV_COPY.searchShortcut}</span>
      </button>
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  )
}
