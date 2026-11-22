'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayActivityLine } from '@/composites/play/topbar/PlayActivityLine'
import { PlayEmpty } from '@/composites/play/shared/PlayEmpty'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { PlayFriendsList } from '@/composites/play/friends/PlayFriendsList'
import { PlayLiveBox } from '@/composites/play/friends/PlayLiveBox'
import { PlayMeBox } from '@/composites/play/friends/PlayMeBox'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import type { PlayKeyGlyphName } from '@/composites/play/mobile/PlayTabGlyphs'
import { PlaySettingsPanel } from '@/composites/play/mobile/PlaySettingsPanel'
import { usePlayActivities } from '@/core/hooks/data/play/usePlayActivities'
import { ROUTES } from '@/declarations/navigation'
import {
  isPlayGameHubPath,
  PLAY_ACTIVITY_COPY,
  PLAY_FRIENDS_COPY,
  PLAY_HOME_COPY,
  PLAY_MOBILE_COPY,
} from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ACTIVITY, PLAY_TOP } from '@/declarations/ui/variants'
import type { PlayFriendsState, PlayLobbyCard, PlayPresence } from '@/types/play'

type Sheet = 'friends' | 'bell' | 'settings'

export interface PlayTopBarProps {
  friends: PlayFriendsState
  tables: PlayLobbyCard[]
  presence: PlayPresence | null
  isLocked: boolean
}

/**
 * Phone header of Play: own box (or the way back from a hub), friends, bell, settings
 * @param {PlayTopBarProps} props - Friends and tables
 * @return {JSX.Element | null}
 */

export const PlayTopBar = ({ friends, tables, presence, isLocked }: PlayTopBarProps) => {
  const path = usePathname()
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const online = usePlayOnline().length
  const { entries, unread, markRead } = usePlayActivities()
  const BackIcon = ICONS.playPrevious
  // Games fill the screen, the administration has its own room
  if (path.startsWith(ROUTES.playSession('')) || path.startsWith(ROUTES.playAdmin)) return null

  const isHub = isPlayGameHubPath(path)
  const sheets: Record<Sheet, { title: string; glyph: PlayKeyGlyphName; body: ReactNode }> = {
    friends: {
      title: PLAY_FRIENDS_COPY.title,
      glyph: 'online',
      body: (
        <div className={PLAY_TOP.sheet}>
          <PlayLiveBox tables={tables} presence={presence} isLocked={isLocked} />
          <PlayFriendsList state={friends} tables={tables} presence={presence} isSheet />
        </div>
      ),
    },
    bell: {
      title: PLAY_HOME_COPY.bell,
      glyph: 'bell',
      body:
        entries.length === 0 ? (
          <PlayEmpty isCompact>{PLAY_ACTIVITY_COPY.empty}</PlayEmpty>
        ) : (
          <ul className={PLAY_ACTIVITY.list}>
            {entries.map((entry) => (
              <PlayActivityLine key={entry.id} entry={entry} />
            ))}
          </ul>
        ),
    },
    settings: { title: PLAY_MOBILE_COPY.settings, glyph: 'settings', body: <PlaySettingsPanel /> },
  }
  const hasDot: Record<Sheet, boolean> = {
    friends: online > 0 || friends.incoming.length > 0,
    bell: unread > 0,
    settings: false,
  }

  const open = (name: Sheet) => {
    if (name === 'bell' && unread > 0) markRead()
    setSheet(name)
  }

  return (
    <header className={PLAY_TOP.bar}>
      {isHub ? (
        <AppLink href={ROUTES.play} className={PLAY_TOP.back}>
          <BackIcon className={PLAY_TOP.backIcon} aria-hidden="true" />
          {PLAY_MOBILE_COPY.hubBack}
        </AppLink>
      ) : (
        <PlayMeBox isPhone />
      )}

      {(Object.keys(sheets) as Sheet[]).map((name) => (
        <button
          key={name}
          type="button"
          aria-label={sheets[name].title}
          title={sheets[name].title}
          className={PLAY_TOP.key}
          onClick={() => open(name)}
        >
          <PlayTabGlyph name={sheets[name].glyph} className={PLAY_TOP.keyIcon} />
          {hasDot[name] && <span className={PLAY_TOP.alert} aria-hidden="true" />}
        </button>
      ))}

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
