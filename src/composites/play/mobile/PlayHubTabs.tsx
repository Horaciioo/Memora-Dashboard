'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import type { PlayTabGlyphName } from '@/composites/play/mobile/PlayTabGlyphs'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_HUB_BAR, PLAY_HUB_TABS } from '@/declarations/ui/variants'

type PlayHubSheet = 'stats' | 'concept' | 'sessions'

const SHEETS: { key: PlayHubSheet; glyph: PlayTabGlyphName; label: string }[] = [
  { key: 'stats', glyph: 'ranking', label: PLAY_MOBILE_COPY.hubStats },
  { key: 'concept', glyph: 'feed', label: PLAY_MOBILE_COPY.hubConceptShort },
  { key: 'sessions', glyph: 'group', label: PLAY_MOBILE_COPY.hubSessions },
]

export interface PlayHubTabsProps {
  // Page body, the logo
  play: ReactNode
  // Jouer, on top of the box
  action: ReactNode
  // Content of each sheet
  panels: Record<PlayHubSheet, ReactNode>
}

/**
 * Game hub on a phone: logo, then a box with Jouer over small sheet buttons
 * @param {PlayHubTabsProps} props - Page body and sheets
 * @return {JSX.Element}
 */

export const PlayHubTabs = ({ play, action, panels }: PlayHubTabsProps) => {
  const [sheet, setSheet] = useState<PlayHubSheet | null>(null)
  const current = SHEETS.find((entry) => entry.key === sheet)

  return (
    <div className={PLAY_HUB_TABS.root}>
      {play}

      <nav aria-label={PLAY_MOBILE_COPY.hubTabs} className={PLAY_HUB_BAR.bar}>
        {action}
        <hr className={PLAY_HUB_BAR.divider} />
        <div className={PLAY_HUB_BAR.strip}>
          {SHEETS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              aria-haspopup="dialog"
              aria-label={entry.label}
              className={PLAY_HUB_BAR.segment}
              onClick={() => setSheet(entry.key)}
            >
              <PlayTabGlyph name={entry.glyph} className={PLAY_HUB_BAR.icon} />
            </button>
          ))}
        </div>
      </nav>

      <BottomSheet
        open={Boolean(current)}
        onClose={() => setSheet(null)}
        title={current?.label ?? ''}
      >
        <div className={PLAY_HUB_TABS.sheet}>{sheet && panels[sheet]}</div>
      </BottomSheet>
    </div>
  )
}
