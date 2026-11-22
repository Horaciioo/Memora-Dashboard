'use client'

import { useEffect } from 'react'
import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayFaces } from '@/composites/play/hub/PlayFaces'
import { PlayLinkLabel } from '@/composites/play/loading/PlayLoadingLabel'
import type { PlayGameLive } from '@/core/lib/play/launcherView'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY, PLAY_LAUNCHER_COPY } from '@/declarations/play'
import { PLAY_CONCEPT } from '@/declarations/play/concept'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayLauncherDetailProps {
  game: PlayGameName
  live?: PlayGameLive
  isFavorite: boolean
  onClose: () => void
  onPlay: () => void
  onFavorite: () => void
}

/**
 * Game sheet flush to the right, lifted above the room: pitch, how it plays, open tables
 * @param {PlayLauncherDetailProps} props - Game and actions
 * @return {JSX.Element}
 */

export const PlayLauncherDetail = ({
  game,
  live,
  isFavorite,
  onClose,
  onPlay,
  onFavorite,
}: PlayLauncherDetailProps) => {
  const meta = PLAY_GAMES.get(game)
  const PlayIcon = ICONS.playResume
  const CloseIcon = ICONS.playClose
  const StarIcon = ICONS.playStar
  const tables = live?.tables ?? []

  // Escape closes the sheet
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <FloatingLayer>
      <div className={PLAY_LAUNCH.veil} onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={meta.label}
        className={PLAY_LAUNCH.panel}
        style={{ '--game': `var(${meta.tone})` } as CSSProperties}
      >
        <div className={PLAY_LAUNCH.panelArt}>
          <PlayGameArt game={game} />
          <span className={PLAY_LAUNCH.panelShade} aria-hidden="true" />
          <button
            type="button"
            aria-label={PLAY_LAUNCHER_COPY.close}
            className={PLAY_LAUNCH.panelClose}
            onClick={onClose}
          >
            <CloseIcon className={PLAY_LAUNCH.panelCloseIcon} aria-hidden="true" />
          </button>
        </div>
        <div className={PLAY_LAUNCH.panelBody}>
          <div className={PLAY_LAUNCH.panelHead}>
            <PlayGameLogo game={game} className={PLAY_LAUNCH.panelLogo} />
            <div>
              <h2 className={PLAY_LAUNCH.panelName}>{meta.label}</h2>
              <p className={PLAY_LAUNCH.panelSeats}>
                {fillPlayMessage(PLAY_HUB_COPY.seats, {
                  min: meta.minPlayers,
                  max: meta.maxPlayers,
                })}
              </p>
            </div>
          </div>
          <p className={PLAY_LAUNCH.panelText}>{meta.tagline}</p>

          <section className={PLAY_LAUNCH.panelSection}>
            <h3 className={PLAY_LAUNCH.panelTitle}>{PLAY_LAUNCHER_COPY.howTo}</h3>
            <div className={PLAY_LAUNCH.panelSteps}>
              {PLAY_CONCEPT[game].map((step) => (
                <p key={step.title} className={PLAY_LAUNCH.panelStep}>
                  <strong>{step.title}</strong>
                  {step.text}
                </p>
              ))}
            </div>
          </section>

          <section className={PLAY_LAUNCH.panelSection}>
            <h3 className={PLAY_LAUNCH.panelTitle}>{PLAY_LAUNCHER_COPY.tables}</h3>
            {tables.length === 0 ? (
              <p className={PLAY_LAUNCH.panelEmpty}>{PLAY_LAUNCHER_COPY.noTables}</p>
            ) : (
              <div className={PLAY_LAUNCH.panelTables}>
                {tables.map((table) => (
                  <div key={table.id} className={PLAY_LAUNCH.panelTable}>
                    <div className={PLAY_LAUNCH.panelTableText}>
                      <span className={PLAY_LAUNCH.panelTableHost}>
                        {fillPlayMessage(PLAY_HUB_COPY.hostedBy, { host: table.hostName ?? '' })}
                      </span>
                      <span className={PLAY_LAUNCH.panelTableNote}>
                        {table.status === PlayStatuses.Running
                          ? PLAY_LAUNCHER_COPY.running
                          : PLAY_LAUNCHER_COPY.lobby}
                        {' · '}
                        {fillPlayMessage(PLAY_LAUNCHER_COPY.seats, {
                          players: table.players,
                          max: table.maxPlayers,
                        })}
                      </span>
                    </div>
                    <PlayFaces people={table.faces} className={PLAY_LAUNCH.panelFaces} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className={PLAY_LAUNCH.panelFoot}>
            <AppLink
              href={ROUTES.playGame(meta.slug)}
              className={PLAY_LAUNCH.panelPlay}
              onClick={onPlay}
            >
              <PlayLinkLabel>
                <PlayIcon className={PLAY_LAUNCH.playIcon} aria-hidden="true" />
                {PLAY_LAUNCHER_COPY.play}
              </PlayLinkLabel>
            </AppLink>
            <button
              type="button"
              aria-pressed={isFavorite}
              className={cn(PLAY_LAUNCH.panelStar, isFavorite && PLAY_LAUNCH.panelStarOn)}
              onClick={onFavorite}
            >
              <StarIcon className={PLAY_LAUNCH.tileStarIcon} aria-hidden="true" />
              <span className={PLAY_LAUNCH.panelStarLabel}>
                {isFavorite ? PLAY_LAUNCHER_COPY.unfavorite : PLAY_LAUNCHER_COPY.favorite}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </FloatingLayer>
  )
}
