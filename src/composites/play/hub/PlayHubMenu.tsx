'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayCreateButton } from '@/composites/play/hub/PlayCreateButton'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, PLAY_HUB } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

// Panels the menu opens: games first, then the player's side
const GAME_VIEWS = [
  { key: 'lobbies', label: PLAY_HUB_COPY.menuLobbies },
  { key: 'running', label: PLAY_HUB_COPY.menuRunning },
] as const
const PLAYER_VIEWS = [
  { key: 'leaders', label: PLAY_HUB_COPY.menuLeaders },
  { key: 'stats', label: PLAY_HUB_COPY.menuStats },
] as const

type PlayHubView = (typeof GAME_VIEWS)[number]['key'] | (typeof PLAYER_VIEWS)[number]['key']

export interface PlayHubMenuProps {
  game: PlayGameName
  canCreate: boolean
  // Why creating is locked
  lockedReason?: string | null
  panels: Record<PlayHubView, ReactNode>
  // Window titles that differ from their button
  titles?: Partial<Record<PlayHubView, string>>
  // Logo side of the divider
  identity: ReactNode
}

/**
 * Logo, divider and actions in the middle, the chosen panel in a window over them
 * @param {PlayHubMenuProps} props - Game, panels and identity
 * @return {JSX.Element}
 */

export const PlayHubMenu = ({
  game,
  canCreate,
  lockedReason,
  panels,
  titles,
  identity,
}: PlayHubMenuProps) => {
  const [view, setView] = useState<PlayHubView | null>(null)
  const CloseIcon = ICONS.playClose
  const open = [...GAME_VIEWS, ...PLAYER_VIEWS].find((entry) => entry.key === view)

  // Escape closes the window
  useEffect(() => {
    if (!view) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setView(null)
    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view])

  const viewButton = (entry: { key: PlayHubView; label: string }) => (
    <Button
      key={entry.key}
      variant="arcade"
      className={PLAY_HUB.hubButton}
      onClick={() => setView(entry.key)}
    >
      {entry.label}
    </Button>
  )

  return (
    <div className={PLAY_HUB.hub}>
      <div className={PLAY_HUB.hubSplit}>
        {identity}
        <span className={PLAY_HUB.hubDivider} aria-hidden="true" />
        <nav className={PLAY_HUB.hubMenu}>
          <div className={PLAY_HUB.hubGroup}>
            <PlayCreateButton
              game={game}
              disabled={!canCreate}
              lockedReason={lockedReason}
              className={PLAY_HUB.hubButton}
            />
            {GAME_VIEWS.map(viewButton)}
          </div>
          <div className={PLAY_HUB.hubGroup}>{PLAYER_VIEWS.map(viewButton)}</div>
          <AppLink
            href={ROUTES.play}
            className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeText, PLAY_HUB.hubButton)}
          >
            {PLAY_HUB_COPY.backToMainHub}
          </AppLink>
        </nav>
      </div>

      {open && view && (
        <div className={PLAY_HUB.sheet}>
          <div className={PLAY_HUB.sheetScrim} onClick={() => setView(null)} aria-hidden="true" />
          <section
            className={PLAY_HUB.sheetWindow}
            role="dialog"
            aria-label={titles?.[view] ?? open.label}
          >
            <header className={PLAY_HUB.sheetHead}>
              <h2 className={PLAY_HUB.sheetTitle}>{titles?.[view] ?? open.label}</h2>
              <button
                type="button"
                className={PLAY_HUB.sheetClose}
                aria-label={PLAY_HUB_COPY.close}
                onClick={() => setView(null)}
              >
                <CloseIcon className={PLAY_HUB.sheetCloseIcon} aria-hidden="true" />
              </button>
            </header>
            <div className={PLAY_HUB.sheetBody}>{panels[view]}</div>
          </section>
        </div>
      )}
    </div>
  )
}
