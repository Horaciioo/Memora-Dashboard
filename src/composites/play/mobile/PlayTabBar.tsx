'use client'

import { usePathname } from 'next/navigation'

import { PlayMeButton } from '@/composites/play/mobile/PlayMeButton'
import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { PLAY_TAB_LABELS, PLAY_TAB_ORDER, playTabIndexOf } from '@/composites/play/mobile/tabs'
import type { PlayTab } from '@/composites/play/mobile/tabs'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { ROUTES } from '@/declarations/navigation'
import type { PlayNoticeView, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'

// Pages where a game fills the screen
const SESSION_PREFIX = ROUTES.playSession('')

export interface PlayTabBarProps {
  invites: PlayNoticeView[]
  presence: PlayPresence | null
  groupCalls: number
}

/**
 * Phone tab bar: the open glyph lifts, the member portrait in the middle
 * @param {PlayTabBarProps} props - Feed data
 * @return {JSX.Element | null}
 */

export const PlayTabBar = ({ invites, presence, groupCalls }: PlayTabBarProps) => {
  const path = usePathname()
  const { note } = usePlayNote()
  if (path.startsWith(SESSION_PREFIX)) return null

  const current = playTabIndexOf(path)
  const isCalling = Boolean(presence) || invites.length > 0
  const hasDot: Partial<Record<PlayTab['key'], boolean>> = {
    feed: isCalling,
    group: groupCalls > 0,
  }

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
        className={cn(
          PLAY_TABS.tab,
          isOn && PLAY_TABS.tabOn,
          (tab.isDesktopOnly || tab.isHidden) && PLAY_TABS.tabDesktop
        )}
      >
        {body(tab, isOn)}
      </AppLink>
    )
  }

  // Tabs of the bar, as many each side of the portrait
  const shown = PLAY_TAB_ORDER.map((tab, index) => ({ tab, index })).filter(
    ({ tab }) => !tab.isHidden
  )
  const middle = Math.ceil(shown.length / 2)

  return (
    <>
      <nav aria-label={PLAY_MOBILE_COPY.tabs} className={PLAY_TABS.bar}>
        <div className={PLAY_TABS.half}>
          {shown.slice(0, middle).map(({ tab, index }) => link(tab, index))}
        </div>
        <PlayMeButton />
        <div className={PLAY_TABS.half}>
          {shown.slice(middle).map(({ tab, index }) => link(tab, index))}
        </div>
      </nav>
      <PlayNote text={note} />
    </>
  )
}
