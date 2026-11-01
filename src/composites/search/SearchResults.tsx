'use client'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { PALETTE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { SearchHit, SearchSection } from '@/types/search'

export interface SearchResultsProps {
  sections: SearchSection[]
  recents: string[]
  isTooShort: boolean
  isLoading: boolean
  // Memora answers instead
  isCommand: boolean
  // Index of a hit under the cursor
  cursorOf: (hit: SearchHit) => number
  cursor: number
  onHover: (index: number) => void
  onOpen: (hit: SearchHit) => void
  onRecent: (term: string) => void
}

/**
 * Search part of the palette
 * @param {SearchResultsProps} props - Results and cursor
 * @return {JSX.Element}
 */

export const SearchResults = ({
  sections,
  recents,
  isTooShort,
  isLoading,
  isCommand,
  cursorOf,
  cursor,
  onHover,
  onOpen,
  onRecent,
}: SearchResultsProps) => {
  const ClockIcon = ICONS.clock
  const showRecents = isTooShort && recents.length > 0
  const isEmpty = sections.every((section) => section.hits.length === 0)

  return (
    <>
      {showRecents &&
        recents.map((recent) => (
          <button
            key={recent}
            type="button"
            onClick={() => onRecent(recent)}
            className={cn(PALETTE_STYLES.result, 'hover:bg-[var(--color-hover)]')}
          >
            <ClockIcon className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{recent}</span>
          </button>
        ))}
      {isTooShort && !showRecents && (
        <p className="px-4 py-6 text-sm text-[var(--color-ink-subtle)]">{NAV_COPY.searchPrompt}</p>
      )}
      {!isTooShort && isLoading && (
        <div className="flex justify-center py-6">
          <BrandLoader variant="ink" />
        </div>
      )}
      {!isTooShort && !isLoading && !isCommand && isEmpty && (
        <p className="px-4 py-6 text-sm text-[var(--color-ink-subtle)]">{NAV_COPY.searchEmpty}</p>
      )}
      {sections.map((section) => (
        <div key={section.group}>
          <p className={PALETTE_STYLES.group}>{section.label}</p>
          {section.hits.map((hit) => (
            <button
              key={`${hit.group}-${hit.id}`}
              type="button"
              onMouseEnter={() => onHover(cursorOf(hit))}
              onClick={() => onOpen(hit)}
              className={cn(
                PALETTE_STYLES.result,
                cursorOf(hit) === cursor && PALETTE_STYLES.resultActive
              )}
            >
              <span className="min-w-0 flex-1 truncate">{hit.label}</span>
              {hit.hint && (
                <span className="shrink-0 text-xs text-[var(--color-ink-subtle)]">{hit.hint}</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </>
  )
}
