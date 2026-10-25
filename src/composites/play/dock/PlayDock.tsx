'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayDockFeed } from '@/composites/play/dock/PlayDockFeed'
import { PlayDockPlayer } from '@/composites/play/dock/PlayDockPlayer'
import { PlayDockStats } from '@/composites/play/dock/PlayDockStats'
import { PlayDockTrophies } from '@/composites/play/dock/PlayDockTrophies'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayInviteView, PlayPresence, PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

// Thought bubbles down to the key, on a slight arc, shrinking
const TRAIL = [
  { x: 14, y: 10, size: 16 },
  { x: 6, y: 32, size: 11 },
  { x: 0, y: 49, size: 7 },
]

// Keys whose arc is mirrored
const MIRRORED: string[] = ['feed']

// Gap kept between a bubble and the screen side
const SCREEN_EDGE = 16

// Delay between two bubbles popping
const TRAIL_STEP_MS = 50

type DockKey = 'trophies' | 'stats' | 'player' | 'feed'

export interface PlayDockProps {
  profile: PlayProfileView
  player: { name: string; avatarUrl: string | null }
  invites: PlayInviteView[]
  presence: PlayPresence | null
}

/**
 * Bubble content of each dock key
 * @typedef {Object} DockEntry
 */

interface DockEntry {
  title: string
  page: string | null
  body: ReactNode
}

/**
 * Bottom dock: trophies, stats, the player, the feed, then the way back
 * @param {PlayDockProps} props - Profile, player and invitations
 * @return {JSX.Element}
 */

export const PlayDock = ({ profile, player, invites, presence }: PlayDockProps) => {
  const [open, setOpen] = useState<DockKey | null>(null)
  const [spot, setSpot] = useState({ left: 0, caret: 0 })
  const bar = useRef<HTMLDivElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(null), [])

  const entries: Record<DockKey, DockEntry> = {
    trophies: {
      title: PLAY_HUB_COPY.dockTrophies,
      page: ROUTES.playTrophies,
      body: <PlayDockTrophies global={profile.global} />,
    },
    stats: {
      title: PLAY_HUB_COPY.dockStats,
      page: ROUTES.playStats,
      body: <PlayDockStats games={profile.games} />,
    },
    player: {
      title: player.name,
      page: ROUTES.playStats,
      body: <PlayDockPlayer totals={profile.global} />,
    },
    feed: {
      title: PLAY_HUB_COPY.dockFeed,
      page: null,
      body: <PlayDockFeed presence={presence} invites={invites} />,
    },
  }

  // Bubble centred on its key, kept inside the screen
  useLayoutEffect(() => {
    const key = open && bar.current?.querySelector(`[data-dock="${open}"]`)
    if (!key || !bar.current || !bubble.current) return
    const keyBox = key.getBoundingClientRect()
    const centre = keyBox.left + keyBox.width / 2
    const half = bubble.current.offsetWidth / 2
    const placed = Math.min(
      Math.max(centre, SCREEN_EDGE + half),
      window.innerWidth - SCREEN_EDGE - half
    )
    setSpot({
      left: placed - bar.current.getBoundingClientRect().left,
      caret: centre - placed + half,
    })
  }, [open])

  useOutsideDismiss(open !== null, bar, close)

  const toggle = (key: DockKey) => setOpen((current) => (current === key ? null : key))

  const iconKey = (key: DockKey, icon: IconName, label: string, extra?: string) => {
    const Icon = ICONS[icon]

    return (
      <button
        data-dock={key}
        type="button"
        aria-label={label}
        aria-expanded={open === key}
        className={cn(PLAY_DOCK.button, open === key && PLAY_DOCK.buttonOn, extra)}
        onClick={() => toggle(key)}
      >
        <Icon className={PLAY_DOCK.icon} />
      </button>
    )
  }

  const entry = open && entries[open]
  // Keys right of the avatar bend the arc the other way
  const arc = open && MIRRORED.includes(open) ? -1 : 1
  const OpenIcon = ICONS.playOpen
  const BackIcon = ICONS.playLeave

  return (
    <nav className={PLAY_DOCK.wrap}>
      <div ref={bar} className={PLAY_DOCK.bar}>
        {entry && (
          <div ref={bubble} className={PLAY_DOCK.bubble} style={{ left: spot.left }} role="dialog">
            {TRAIL.map((dot, index) => (
              <span
                key={dot.size}
                className={PLAY_DOCK.trail}
                style={{
                  left: spot.caret + dot.x * arc - dot.size / 2,
                  top: `calc(100% + ${dot.y}px)`,
                  width: dot.size,
                  height: dot.size,
                  animationDelay: `${(TRAIL.length - 1 - index) * TRAIL_STEP_MS}ms`,
                }}
                aria-hidden="true"
              />
            ))}
            <div className={PLAY_DOCK.head}>
              <span className={PLAY_DOCK.title}>{entry.title}</span>
              {entry.page && (
                <AppLink
                  href={entry.page}
                  aria-label={PLAY_HUB_COPY.openPage}
                  className={PLAY_DOCK.open}
                  onClick={close}
                >
                  <OpenIcon className={PLAY_DOCK.openIcon} />
                </AppLink>
              )}
            </div>
            <div className={PLAY_DOCK.content}>{entry.body}</div>
          </div>
        )}

        {iconKey('trophies', 'playTrophy', PLAY_HUB_COPY.dockTrophies)}
        {iconKey('stats', 'playStats', PLAY_HUB_COPY.dockStats)}
        <button
          data-dock="player"
          type="button"
          aria-label={PLAY_HUB_COPY.dockPlayer}
          aria-expanded={open === 'player'}
          className={PLAY_DOCK.avatarButton}
          onClick={() => toggle('player')}
        >
          <Avatar
            name={player.name}
            src={player.avatarUrl}
            size="lg"
            className={PLAY_DOCK.avatarRing}
          />
          <span className={PLAY_DOCK.level}>{profile.global.level.level}</span>
        </button>
        {iconKey(
          'feed',
          'playFeed',
          PLAY_HUB_COPY.dockFeed,
          presence || invites.length > 0 ? PLAY_DOCK.buttonCall : undefined
        )}
        <span className={PLAY_DOCK.split} aria-hidden="true" />
        <AppLink
          href={ROUTES.dashboard}
          aria-label={PLAY_HUB_COPY.backToDashboard}
          title={PLAY_HUB_COPY.backToDashboard}
          className={PLAY_DOCK.button}
        >
          <BackIcon className={PLAY_DOCK.icon} />
        </AppLink>
      </div>
    </nav>
  )
}
