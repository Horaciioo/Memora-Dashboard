'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { PlayOnlineList } from '@/composites/play/mobile/PlayOnlineList'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import type { PlayKeyGlyphName } from '@/composites/play/mobile/PlayTabGlyphs'
import { PlaySettingsPanel } from '@/composites/play/mobile/PlaySettingsPanel'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PLAY_TOP } from '@/declarations/ui/variants'
import type { PlayLobbyCard } from '@/types/play'

type Sheet = 'online' | 'live' | 'settings'

export interface PlayTopBarProps {
  // Red key on the left, no words
  back: { href: string; label: string; icon: IconName }
  tables: PlayLobbyCard[]
  // Tables being played, drawn by the page
  live: ReactNode
}

/**
 * Phone header of the Play home: red back key, online, sessions, settings
 * @param {PlayTopBarProps} props - Back, tables
 * @return {JSX.Element}
 */

export const PlayTopBar = ({ back, tables, live }: PlayTopBarProps) => {
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const online = usePlayOnline().length

  const BackIcon = ICONS[back.icon]

  const sheets: Record<Sheet, { title: string; glyph: PlayKeyGlyphName; body: ReactNode }> = {
    online: {
      title: PLAY_MOBILE_COPY.online,
      glyph: 'online',
      body: <PlayOnlineList tables={tables} />,
    },
    live: { title: PLAY_MOBILE_COPY.live, glyph: 'live', body: live },
    settings: { title: PLAY_MOBILE_COPY.settings, glyph: 'settings', body: <PlaySettingsPanel /> },
  }

  const key = (name: Sheet) => {
    return (
      <button
        key={name}
        type="button"
        aria-label={sheets[name].title}
        title={sheets[name].title}
        className={PLAY_TOP.key}
        onClick={() => setSheet(name)}
      >
        <PlayTabGlyph name={sheets[name].glyph} className={PLAY_TOP.keyIcon} />
        {name === 'online' && online > 0 && <span className={PLAY_TOP.dot} aria-hidden="true" />}
      </button>
    )
  }

  return (
    <header className={PLAY_TOP.bar}>
      <AppLink
        href={back.href}
        aria-label={back.label}
        title={back.label}
        className={PLAY_TOP.back}
      >
        <BackIcon className={PLAY_TOP.backIcon} />
      </AppLink>

      <div className={PLAY_TOP.keys}>{(['online', 'live', 'settings'] as const).map(key)}</div>

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet ? sheets[sheet].title : ''}
        figure={sheet && <h2 className={PLAY_TOP.sheetTitle}>{sheets[sheet].title}</h2>}
      >
        {sheet && sheets[sheet].body}
      </BottomSheet>
    </header>
  )
}
