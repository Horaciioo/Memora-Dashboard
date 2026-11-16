'use client'

import { useRef, useState } from 'react'

import { LevelFrame } from '@/composites/play/skin/LevelFrame'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayTabGlyph } from '@/composites/play/mobile/PlayTabGlyphs'
import { usePlayLevel } from '@/core/hooks/data/play/usePlayLevel'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_ME_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

/**
 * Portrait in the middle of the tab bar, opening stats or the way out of Play
 * @return {JSX.Element | null}
 */

export const PlayMeButton = () => {
  const { session } = useAuthContext()
  const level = usePlayLevel()
  const [isOpen, setIsOpen] = useState(false)
  const boundary = useRef<HTMLDivElement>(null)
  useOutsideDismiss(isOpen, boundary, () => setIsOpen(false))
  const LeaveIcon = ICONS.playLeave
  const SettingsIcon = ICONS.settings

  if (!session) return null

  return (
    <div ref={boundary} className={PLAY_TABS.meHost}>
      <button
        type="button"
        aria-label={PLAY_ME_COPY.open}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className={PLAY_TABS.me}
      >
        <span className={PLAY_TABS.portrait}>
          <LevelFrame
            level={level ?? 0}
            name={session.displayName}
            src={session.avatarUrl}
            size="lg"
          />
        </span>
      </button>

      {isOpen && (
        <div role="menu" className={PLAY_TABS.menu}>
          <AppLink
            role="menuitem"
            href={ROUTES.playStats}
            onClick={() => setIsOpen(false)}
            className={PLAY_TABS.menuItem}
          >
            <PlayTabGlyph name="stats" className={PLAY_TABS.menuIcon} />
            {PLAY_ME_COPY.stats}
          </AppLink>
          <AppLink
            role="menuitem"
            href={ROUTES.playSettings}
            onClick={() => setIsOpen(false)}
            className={PLAY_TABS.menuItem}
          >
            <SettingsIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
            {PLAY_ME_COPY.settings}
          </AppLink>
          <AppLink
            role="menuitem"
            href={ROUTES.dashboard}
            className={cn(PLAY_TABS.menuItem, PLAY_TABS.menuLeave)}
          >
            <LeaveIcon className={PLAY_TABS.menuIcon} aria-hidden="true" />
            {PLAY_ME_COPY.leave}
          </AppLink>
        </div>
      )}
    </div>
  )
}
