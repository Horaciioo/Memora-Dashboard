'use client'

import { usePathname } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayBarPlayer } from '@/composites/play/mobile/PlayBarPlayer'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { PLAY_TAB_LABELS, PLAY_TAB_ORDER, playTabIndexOf } from '@/composites/play/mobile/tabs'
import type { PlayTab } from '@/composites/play/mobile/tabs'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import type { PlayNoticeView, PlayPresence, PlayTotalsView } from '@/types/play'
import { cn } from '@/utils/classnames'

// Pages where a game fills the screen
const SESSION_PREFIX = '/play/sessions/'

export interface PlayTabBarProps {
  invites: PlayNoticeView[]
  presence: PlayPresence | null
  groupCalls: number
  player: { name: string; avatarUrl: string | null }
  totals: PlayTotalsView
}

// Tabs left of the desktop player
const LEFT_TABS = 3

/**
 * Phone tab bar: the open tab widens and lifts
 * @param {PlayTabBarProps} props - Feed data
 * @return {JSX.Element | null}
 */

export const PlayTabBar = ({ invites, presence, groupCalls, player, totals }: PlayTabBarProps) => {
  const path = usePathname()
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

    return (
      <AppLink
        key={tab.key}
        href={tab.href}
        aria-current={isOn ? 'page' : undefined}
        aria-label={tab.key === 'stats' ? PLAY_MOBILE_COPY.tabStatsFull : undefined}
        className={cn(PLAY_TABS.tab, isOn && PLAY_TABS.tabOn)}
      >
        {body(tab, isOn)}
      </AppLink>
    )
  }

  return (
    <nav aria-label={PLAY_MOBILE_COPY.tabs} className={PLAY_TABS.bar}>
      {PLAY_TAB_ORDER.slice(0, LEFT_TABS).map((tab, index) => link(tab, index))}
      <PlayBarPlayer player={player} totals={totals} />
      {PLAY_TAB_ORDER.slice(LEFT_TABS).map((tab, index) => link(tab, index + LEFT_TABS))}
      <AppLink
        href={ROUTES.dashboard}
        aria-label={PLAY_HUB_COPY.backToDashboard}
        title={PLAY_HUB_COPY.backToDashboard}
        className={PLAY_TABS.exit}
      >
        <ExitIcon className={PLAY_TABS.exitIcon} />
      </AppLink>
    </nav>
  )
}
