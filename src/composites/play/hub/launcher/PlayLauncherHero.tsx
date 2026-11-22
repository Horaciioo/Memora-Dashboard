'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { PlayFaces } from '@/composites/play/hub/PlayFaces'
import { PlayLinkLabel } from '@/composites/play/loading/PlayLoadingLabel'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { boostPercentOf } from '@/core/lib/play/boost'
import type { PlayGameLive } from '@/core/lib/play/launcherView'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY, PLAY_LAUNCHER_COPY } from '@/declarations/play'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { PLAY_LAUNCHER_SLIDE_SECONDS, PLAY_LAUNCHER_SWIPE_PX } from '@/declarations/play/launcher'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import type { PlayConfigView } from '@/types/play'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayLauncherHeroProps {
  games: PlayGameName[]
  config: PlayConfigView
  live: Partial<Record<PlayGameName, PlayGameLive>>
  onDetails: (game: PlayGameName) => void
  onPlay: (game: PlayGameName) => void
}

/**
 * Full-frame banner turning through the featured games
 * @param {PlayLauncherHeroProps} props - Games, activity and actions
 * @return {JSX.Element | null}
 */

export const PlayLauncherHero = ({
  games,
  config,
  live,
  onDetails,
  onPlay,
}: PlayLauncherHeroProps) => {
  const [index, setIndex] = useState(0)
  const pressX = useRef<number | null>(null)
  const isPhone = useIsMobileShell()
  const PlayIcon = ICONS.playResume
  const StarIcon = ICONS.playStar

  // Next banner once the bar is full
  useEffect(() => {
    if (games.length < 2) return
    const timer = window.setTimeout(
      () => setIndex((value) => (value + 1) % games.length),
      PLAY_LAUNCHER_SLIDE_SECONDS * 1000
    )

    return () => window.clearTimeout(timer)
  }, [games.length, index])

  if (games.length === 0) return null

  // A finger slide turns the banner, the page tabs keep still
  const onPointerDown = (event: PointerEvent) => {
    event.stopPropagation()
    pressX.current = event.clientX
  }
  const onPointerUp = (event: PointerEvent) => {
    const travel = event.clientX - (pressX.current ?? event.clientX)
    pressX.current = null
    if (games.length < 2 || Math.abs(travel) < PLAY_LAUNCHER_SWIPE_PX) return
    setIndex((value) => (value + (travel < 0 ? 1 : games.length - 1)) % games.length)
  }

  // Thumbs of the featured games, under the banner on a phone
  const strip = games.length > 1 && (
    <div className={PLAY_LAUNCH.strip}>
      {games.map((game, position) => {
        const meta = PLAY_GAMES.get(game)
        const isOn = position === index

        return (
          <button
            key={game}
            type="button"
            aria-label={`${PLAY_LAUNCHER_COPY.slide} ${meta.label}`}
            title={meta.label}
            aria-current={isOn}
            className={cn(PLAY_LAUNCH.thumb, isOn && PLAY_LAUNCH.thumbOn)}
            style={{ '--game': `var(${meta.tone})` } as CSSProperties}
            onClick={() => setIndex(position)}
          >
            <span className={PLAY_LAUNCH.thumbArt}>
              <PlayPosterArt game={game} />
            </span>
            {isOn && (
              <span className={PLAY_LAUNCH.bar} aria-hidden="true">
                <span key={index} className={PLAY_LAUNCH.barFill} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      <section
        className={PLAY_LAUNCH.hero}
        aria-label={PLAY_LAUNCHER_COPY.hero}
        style={{ '--hero-seconds': `${PLAY_LAUNCHER_SLIDE_SECONDS}s` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {games.map((game, position) => {
          const meta = PLAY_GAMES.get(game)
          const faces = live[game]?.faces ?? []
          const isOn = position === index
          const boost = boostPercentOf(config, game)

          return (
            <div
              key={game}
              className={cn(PLAY_LAUNCH.slide, !isOn && PLAY_LAUNCH.slideOff)}
              style={{ '--game': `var(${meta.tone})` } as CSSProperties}
              aria-hidden={!isOn}
              inert={!isOn}
            >
              <PlayGameArt game={game} className={PLAY_LAUNCH.art} />
              <span className={PLAY_LAUNCH.shadeSide} aria-hidden="true" />
              <span className={PLAY_LAUNCH.shadeBottom} aria-hidden="true" />
              <div className={PLAY_LAUNCH.body}>
                <div className={PLAY_LAUNCH.vedette}>
                  <span className={PLAY_LAUNCH.vedetteTag}>
                    <StarIcon className={PLAY_LAUNCH.vedetteIcon} aria-hidden="true" />
                    {PLAY_CONFIG_COPY.vedette}
                  </span>
                  {boost > 0 && (
                    <span className={PLAY_LAUNCH.vedetteBoost}>
                      {fillPlayMessage(PLAY_CONFIG_COPY.boostBadge, { percent: boost })}
                    </span>
                  )}
                </div>
                <div className={PLAY_LAUNCH.brand}>
                  <PlayGameLogo game={game} className={PLAY_LAUNCH.logo} />
                  <p className={PLAY_LAUNCH.kicker}>
                    {fillPlayMessage(PLAY_HUB_COPY.seats, {
                      min: meta.minPlayers,
                      max: meta.maxPlayers,
                    })}
                  </p>
                </div>
                <h2 className={PLAY_LAUNCH.name}>{meta.label}</h2>
                <p className={PLAY_LAUNCH.tagline}>{meta.tagline}</p>
                <div className={PLAY_LAUNCH.actions}>
                  <AppLink
                    href={ROUTES.playGame(meta.slug)}
                    className={PLAY_LAUNCH.play}
                    onClick={() => onPlay(game)}
                  >
                    <PlayLinkLabel>
                      <PlayIcon className={PLAY_LAUNCH.playIcon} aria-hidden="true" />
                      {PLAY_LAUNCHER_COPY.play}
                    </PlayLinkLabel>
                  </AppLink>
                  <button
                    type="button"
                    className={PLAY_LAUNCH.ghost}
                    onClick={() => onDetails(game)}
                  >
                    {PLAY_LAUNCHER_COPY.details}
                  </button>
                  {faces.length > 0 && (
                    <div className={PLAY_LAUNCH.waiting}>
                      <PlayFaces people={faces} />
                      {PLAY_LAUNCHER_COPY.waiting}
                    </div>
                  )}
                </div>
              </div>
              <div className={PLAY_LAUNCH.poster} aria-hidden="true">
                <PlayPosterArt game={game} />
              </div>
            </div>
          )
        })}

        {!isPhone && strip}
      </section>
      {isPhone && strip}
    </>
  )
}
