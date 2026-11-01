'use client'

import { useEffect, useState } from 'react'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { CommandPalette } from '@/composites/search/CommandPalette'
import { useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { SEARCH_LAUNCHER } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { BUTTON_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SearchLauncherProps {
  // Overrides the standard glyph button
  className?: string
  iconClassName?: string
  // Full bar variant
  expanded?: boolean
  // Answers Cmd K
  shortcut?: boolean
  // After the chat opens
  onOpen?: () => void
}

/**
 * Memora bar opening the chat, Cmd K opens the palette
 * @param {string} [className] - Classes overriding the standard glyph button
 * @param {string} [iconClassName] - Classes overriding the standard glyph size
 * @param {boolean} [expanded] - Renders the full bar
 * @param {boolean} [shortcut] - Answers Cmd K
 * @param {() => void} [onOpen] - After the chat opens
 * @return {JSX.Element}
 */

export const SearchLauncher = ({
  className,
  iconClassName,
  expanded,
  shortcut = true,
  onOpen,
}: SearchLauncherProps = {}) => {
  const [isOpen, setOpen] = useState(false)
  const openChat = useAssistantDock((state) => state.open)

  useEffect(() => {
    if (!shortcut) return

    const onKeyDown = (event: KeyboardEvent) => {
      // Cmd or Ctrl plus K opens the palette from anywhere
      if (event.key?.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return

      event.preventDefault()
      setOpen((open) => !open)
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shortcut])

  return (
    <>
      <button
        type="button"
        aria-label={ASSISTANT_COPY.launcherTitle}
        title={`${ASSISTANT_COPY.launcherTitle}, ${NAV_COPY.searchShortcut}`}
        onClick={() => {
          openChat()
          onOpen?.()
        }}
        className={cn(
          'brain-wake',
          className ?? cn(BUTTON_STYLES.base, expanded ? SEARCH_LAUNCHER.bar : BUTTON_STYLES.icon)
        )}
      >
        <BrainMark motion="idle" className={iconClassName ?? SEARCH_LAUNCHER.brain} />
        {expanded && <span className={SEARCH_LAUNCHER.barLabel}>{ASSISTANT_COPY.launcher}</span>}
      </button>
      {isOpen && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  )
}
