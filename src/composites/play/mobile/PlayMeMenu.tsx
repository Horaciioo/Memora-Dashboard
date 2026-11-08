'use client'

import { useCallback, useRef, useState } from 'react'

import { logout } from '@/app/login/actions'
import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayMeMenuProps {
  player: { name: string; avatarUrl: string | null }
  level: number
}

/**
 * Avatar of the bar: opens a box to reach the settings or sign out
 * @param {PlayMeMenuProps} props - Player
 * @return {JSX.Element}
 */

export const PlayMeMenu = ({ player, level }: PlayMeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setIsOpen(false), [])
  const SettingsIcon = ICONS.settings
  const SignOutIcon = ICONS.signOut

  useOutsideDismiss(isOpen, root, close)

  return (
    <div ref={root} className={PLAY_TABS.me}>
      {isOpen && (
        <div role="menu" className={PLAY_TABS.meMenu}>
          <AppLink
            href={ROUTES.preferencesPlay}
            role="menuitem"
            className={PLAY_TABS.meItem}
            onClick={close}
          >
            <SettingsIcon className={PLAY_TABS.meIcon} aria-hidden="true" />
            {PLAY_MOBILE_COPY.meSettings}
          </AppLink>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className={cn(PLAY_TABS.meItem, PLAY_TABS.meItemDanger)}
            >
              <SignOutIcon className={PLAY_TABS.meIcon} aria-hidden="true" />
              {AUTH_COPY.signOut}
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        aria-label={PLAY_MOBILE_COPY.tabMe}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={PLAY_TABS.meButton}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar
          name={player.name}
          src={player.avatarUrl}
          size="lg"
          className={PLAY_TABS.meAvatar}
        />
        <span className={PLAY_TABS.meLevel}>{level}</span>
      </button>
    </div>
  )
}
