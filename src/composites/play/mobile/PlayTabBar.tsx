'use client'

import { usePathname } from 'next/navigation'

import { PlayNote } from '@/composites/play/hub/notices/PlayNote'
import { usePlayNote } from '@/core/hooks/interaction/state/play/usePlayNote'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { PLAY_PHONE_TABS, PLAY_TAB_LABELS, playTabIndexOf } from '@/composites/play/mobile/tabs'
import { isPlayGameHubPath, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { ROUTES } from '@/declarations/navigation'
import type { PlayNoticeView, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayTabBarProps {
  invites: PlayNoticeView[]
  presence: PlayPresence | null
  groupCalls: number
}

/**
 * Phone tab bar: the desktop pages
 * @param {PlayTabBarProps} props - Waiting calls
 * @return {JSX.Element | null}
 */

export const PlayTabBar = ({ invites, presence, groupCalls }: PlayTabBarProps) => {
  const path = usePathname()
  const { note } = usePlayNote()
  // Games and their hubs fill the screen
  if (path.startsWith(ROUTES.playSession('')) || isPlayGameHubPath(path)) return null

  const current = playTabIndexOf(path, PLAY_PHONE_TABS)
  const hasCall = Boolean(presence) || invites.length > 0 || groupCalls > 0

  return (
    <>
      <nav aria-label={PLAY_MOBILE_COPY.tabs} className={PLAY_TABS.bar}>
        {PLAY_PHONE_TABS.map((tab, index) => {
          const isOn = index === current
          const isHome = tab.key === 'home'

          return (
            <AppLink
              key={tab.key}
              href={tab.href}
              aria-current={isOn ? 'page' : undefined}
              className={cn(PLAY_TABS.tab, isHome && PLAY_TABS.tabHome)}
            >
              <span className={cn(PLAY_TABS.lift, isHome && PLAY_TABS.liftHome)}>
                <PlayTabGlyph
                  name={tab.key}
                  isOn={isOn}
                  className={cn(
                    isHome ? PLAY_TABS.iconHome : PLAY_TABS.icon,
                    isOn ? PLAY_TABS.iconOn : PLAY_TABS.iconRest
                  )}
                />
                {tab.key === 'group' && hasCall && (
                  <span className={PLAY_TABS.badge} aria-hidden="true" />
                )}
              </span>
              <span className={isOn || isHome ? PLAY_TABS.label : PLAY_TABS.labelRest}>
                {PLAY_TAB_LABELS[tab.key]}
              </span>
            </AppLink>
          )
        })}
      </nav>
      <PlayNote text={note} />
    </>
  )
}
