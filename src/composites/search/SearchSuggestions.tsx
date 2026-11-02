'use client'

import { Glyph } from '@/components/elements/display/glyphs/Glyph'
import { usePaletteEntries } from '@/core/hooks/interaction/layout/usePaletteEntries'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PALETTE_STYLES } from '@/declarations/ui/variants'

export interface SearchSuggestionsProps {
  onGo: (href: string) => void
}

/**
 * Palette empty state
 * @param {SearchSuggestionsProps} props - Handler
 * @return {JSX.Element}
 */

export const SearchSuggestions = ({ onGo }: SearchSuggestionsProps) => {
  const { asks, shortcuts, recents } = usePaletteEntries()

  return (
    <div>
      {asks.length > 0 && <p className={PALETTE_STYLES.group}>{ASSISTANT_COPY.paletteAsks}</p>}
      {asks.map(({ offer, icon }) => {
        const Icon = ICONS[icon]

        return (
          <button
            key={offer.ask}
            type="button"
            onClick={() => onGo(offer.href)}
            className={PALETTE_STYLES.suggestion}
          >
            <Icon className={PALETTE_STYLES.suggestionIcon} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{offer.ask}</span>
          </button>
        )
      })}
      {recents.length > 0 && (
        <p className={PALETTE_STYLES.group}>{ASSISTANT_COPY.paletteRecents}</p>
      )}
      {recents.map((item) => {
        const Icon = ICONS[item.icon]

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => onGo(item.href)}
            className={PALETTE_STYLES.suggestion}
          >
            {item.emoji ? (
              <Glyph value={item.emoji} size="row" />
            ) : (
              <Icon className={PALETTE_STYLES.suggestionIcon} aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
        )
      })}
      {shortcuts.length > 0 && <p className={PALETTE_STYLES.group}>{ASSISTANT_COPY.paletteGoes}</p>}
      <div className={PALETTE_STYLES.chips}>
        {shortcuts.map((item) => {
          const Icon = ICONS[item.icon]

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onGo(item.href)}
              className={PALETTE_STYLES.chip}
            >
              <Icon className={PALETTE_STYLES.chipIcon} aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
