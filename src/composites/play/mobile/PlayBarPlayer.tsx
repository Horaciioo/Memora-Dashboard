'use client'

import { useCallback, useRef, useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayDockPlayer } from '@/composites/play/dock/PlayDockPlayer'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TABS } from '@/declarations/ui/variants'
import type { PlayTotalsView } from '@/types/play'

export interface PlayBarPlayerProps {
  player: { name: string; avatarUrl: string | null }
  totals: PlayTotalsView
}

/**
 * Desktop tab bar centre: the player, level bubble on click
 * @param {PlayBarPlayerProps} props - Player and totals
 * @return {JSX.Element}
 */

export const PlayBarPlayer = ({ player, totals }: PlayBarPlayerProps) => {
  const [isOpen, setOpen] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutsideDismiss(isOpen, anchor, close)
  const OpenIcon = ICONS.playOpen

  return (
    <div ref={anchor} className={PLAY_TABS.player}>
      <button
        type="button"
        aria-label={PLAY_HUB_COPY.dockPlayer}
        aria-expanded={isOpen}
        className={PLAY_TABS.playerButton}
        onClick={() => setOpen((open) => !open)}
      >
        <Avatar
          name={player.name}
          src={player.avatarUrl}
          size="lg"
          className={PLAY_TABS.playerRing}
        />
        <span className={PLAY_TABS.playerLevel}>{totals.level.level}</span>
      </button>
      {isOpen && (
        <div role="dialog" className={PLAY_TABS.playerBubble}>
          <div className={PLAY_TABS.playerHead}>
            <span className={PLAY_TABS.playerName}>{player.name}</span>
            <AppLink
              href={ROUTES.playStats}
              aria-label={PLAY_HUB_COPY.openPage}
              className={PLAY_TABS.playerOpen}
              onClick={close}
            >
              <OpenIcon className={PLAY_TABS.playerOpenIcon} />
            </AppLink>
          </div>
          <PlayDockPlayer totals={totals} />
        </div>
      )}
    </div>
  )
}
