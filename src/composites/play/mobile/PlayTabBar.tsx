'use client'

import { usePathname } from 'next/navigation'

import { PlayNote } from '@/composites/play/hub/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayMeMenu } from '@/composites/play/mobile/PlayMeMenu'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import {
  PLAY_ME_AFTER,
  PLAY_TAB_LABELS,
  PLAY_TAB_ORDER,
  playTabIndexOf,
} from '@/composites/play/mobile/tabs'
import type { PlayTab } from '@/composites/play/mobile/tabs'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import type { PlayNoticeView, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'

// Pages where a game fills the screen
const SESSION_PREFIX = '/play/sessions/'

export interface PlayTabBarProps {
  player: { name: string; avatarUrl: string | null }
  level: number
  invites: PlayNoticeView[]
  presence: PlayPresence | null
  groupCalls: number
}

/**
 * Phone tab bar: the open tab widens and lifts
 * @param {PlayTabBarProps} props - Feed data
 * @return {JSX.Element | null}
 */

export const PlayTabBar = ({ player, level, invites, presence, groupCalls }: PlayTabBarProps) => {
  const path = usePathname()
  const { note, show } = usePlayNote()
  if (path.startsWith(SESSION_PREFIX)) return null

  const current = playTabIndexOf(path)
  const isCalling = Boolean(presence) || invites.length > 0
  const hasDot: Partial<Record<PlayTab['key'], boolean>> = {
    feed: isCalling,
    group: groupCalls > 0,
  }

  const ExitIcon = ICONS.playLeave

  const body = (tab: PlayTab, isOn: boolean) => (
    <>
      <span className={PLAY_TABS.lift}>
        <PlayTabGlyph
          name={tab.key}
          isOn={isOn}
          className={cn(PLAY_TABS.icon, isOn ? PLAY_TABS.iconOn : PLAY_TABS.iconRest)}
        />
        {hasDot[tab.key] && <span className={PLAY_TABS.badge} aria-hidden="true" />}
      </span>
      <span className={isOn ? PLAY_TABS.label : PLAY_TABS.labelRest}>
        {PLAY_TAB_LABELS[tab.key]}
      </span>
    </>
  )

  const link = (tab: PlayTab, index: number) => {
    const isOn = index === current

    if (tab.key === 'stats') {
      return (
        <button
          key={tab.key}
          type="button"
          aria-label={PLAY_MOBILE_COPY.tabStatsFull}
          className={cn(PLAY_TABS.tab, isOn && PLAY_TABS.tabOn)}
          onClick={() => show(PLAY_HUB_COPY.statsConstruction)}
        >
          {body(tab, isOn)}
        </button>
      )
    }

    return (
      <AppLink
        key={tab.key}
        href={tab.href}
        aria-current={isOn ? 'page' : undefined}
        className={cn(
          PLAY_TABS.tab,
          isOn && PLAY_TABS.tabOn,
          tab.isDesktopOnly && PLAY_TABS.tabDesktop
        )}
      >
        {body(tab, isOn)}
      </AppLink>
    )
  }

  return (
    <>
      <nav aria-label={PLAY_MOBILE_COPY.tabs} className={PLAY_TABS.bar}>
        {PLAY_TAB_ORDER.flatMap((tab, index) =>
          tab.key === PLAY_ME_AFTER
            ? [link(tab, index), <PlayMeMenu key="me" player={player} level={level} />]
            : [link(tab, index)]
        )}
      </nav>
      <AppLink
        href={ROUTES.dashboard}
        aria-label={PLAY_HUB_COPY.backToDashboard}
        title={PLAY_HUB_COPY.backToDashboard}
        className={PLAY_TABS.exit}
      >
        <ExitIcon className={PLAY_TABS.exitIcon} />
      </AppLink>
      <PlayNote text={note} />
    </>
  )
}
