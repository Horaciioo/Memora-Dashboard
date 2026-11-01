'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { AssistantPreviewRow } from '@/composites/search/assistant/AssistantPreviewRow'
import { AssistantThread } from '@/composites/search/assistant/AssistantThread'
import { SearchResults } from '@/composites/search/SearchResults'
import { useAssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { useAssistantPreview } from '@/core/hooks/data/system/useAssistantPreview'
import { useSearch } from '@/core/hooks/data/system/useSearch'
import { useFocusTrap } from '@/core/hooks/interaction/layout/useFocusTrap'
import { useRecentSearches } from '@/core/hooks/interaction/state/useRecentSearches'
import { useScrollLock } from '@/core/hooks/interaction/layout/useScrollLock'
import { useAssistantStore } from '@/core/store/assistant'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ASSISTANT_STYLES, PALETTE_STYLES } from '@/declarations/ui/variants'
import type { SearchHit } from '@/types/search'

export interface CommandPaletteProps {
  onClose: () => void
}

/**
 * Search and Memora in one overlay
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element | null}
 */

export const CommandPalette = ({ onClose }: CommandPaletteProps) => {
  const router = useRouter()
  const [term, setTerm] = useState('')
  const [pointer, setPointer] = useState({ term: '', cursor: 0 })
  const { recents, remember } = useRecentSearches()
  const rememberRefs = useAssistantStore((state) => state.remember)
  const containerRef = useFocusTrap(true, onClose)
  useScrollLock(true)

  const openHref = (href: string) => {
    onClose()
    router.push(href)
  }

  const chat = useAssistantChat(openHref)
  const isChat = chat.turns.length > 0
  const preview = useAssistantPreview(isChat ? '' : term)
  const { sections, isLoading } = useSearch(isChat ? '' : term)

  // Memora's row leads the list
  const hits = useMemo(() => sections.flatMap((section) => section.hits), [sections])
  const lead = preview.isCommand ? 1 : 0
  const total = hits.length + lead

  // A new term always sends the cursor back to the first row
  if (pointer.term !== term) setPointer({ term, cursor: 0 })

  const cursor = pointer.cursor
  const setCursor = (next: number) => setPointer({ term, cursor: next })

  if (typeof document === 'undefined') return null

  const openHit = (hit: SearchHit) => {
    remember(term)
    openHref(hit.href)
  }

  // A clear page goes at once
  const engage = () => {
    const { proposal } = preview
    const isDirect = proposal?.status === 'ready' && proposal.action?.kind === 'navigate'
    if (isDirect && proposal.action?.kind === 'navigate') {
      rememberRefs(proposal.memory)
      openHref(proposal.action.href)
      return
    }

    chat.start(term, preview.isLoading ? null : proposal)
    setTerm('')
  }

  // Enter while talking answers or asks again
  const submitChat = () => {
    chat.send(term)
    setTerm('')
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isChat) {
      event.preventDefault()
      submitChat()
      return
    }
    if (total === 0) return

    // Rows walk in a loop
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 }
    if (event.key in steps) {
      event.preventDefault()
      setCursor((cursor + steps[event.key] + total) % total)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (cursor < lead) engage()
      else openHit(hits[cursor - lead])
    }
  }

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
        aria-label={ASSISTANT_COPY.launcherTitle}
        className={PALETTE_STYLES.panel}
      >
        <div className={PALETTE_STYLES.field}>
          <BrainMark
            motion={chat.isBusy || preview.isLoading ? 'loop' : 'idle'}
            className={ASSISTANT_STYLES.fieldMark}
          />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              chat.isAnswering ? ASSISTANT_COPY.answerPlaceholder : ASSISTANT_COPY.placeholder
            }
            aria-label={ASSISTANT_COPY.launcherTitle}
            className={PALETTE_STYLES.input}
          />
        </div>
        <div className={PALETTE_STYLES.divider} role="separator" />
        <div className={PALETTE_STYLES.results}>
          {isChat ? (
            <AssistantThread chat={chat} onSuggestion={(text) => chat.start(text)} />
          ) : (
            <>
              {preview.isCommand && (
                <AssistantPreviewRow
                  proposal={preview.proposal}
                  isLoading={preview.isLoading}
                  isActive={cursor === 0}
                  onHover={() => setCursor(0)}
                  onSelect={engage}
                />
              )}
              <SearchResults
                sections={sections}
                recents={recents}
                isTooShort={isTooShort}
                isLoading={isLoading}
                isCommand={preview.isCommand}
                cursorOf={(hit) => hits.indexOf(hit) + lead}
                cursor={cursor}
                onHover={setCursor}
                onOpen={openHit}
                onRecent={setTerm}
              />
            </>
          )}
        </div>
        <div className={PALETTE_STYLES.hint}>
          {isChat ? (
            <button type="button" onClick={chat.reset} className="hover:underline">
              {ASSISTANT_COPY.back}
            </button>
          ) : (
            <span>{NAV_COPY.searchNavigate}</span>
          )}
          <span>{NAV_COPY.searchShortcut}</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
