import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayFaces } from '@/composites/play/hub/PlayFaces'
import { PlayLinkLabel } from '@/composites/play/loading/PlayLoadingLabel'
import type { PlayGameLive } from '@/core/lib/play/launcherView'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY, PLAY_LAUNCHER_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_LAUNCH } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayLauncherTileProps {
  game: PlayGameName
  playable: boolean
  live?: PlayGameLive
  // Extra XP percent while featured, null off the banner
  boost: number | null
  isFavorite: boolean
  onOpen: () => void
  onPlay: () => void
  onFavorite: () => void
}

/**
 * Library tile: art, live tag, star, a play key on hover, a click opens the details
 * @param {PlayLauncherTileProps} props - Game and actions
 * @return {JSX.Element}
 */

export const PlayLauncherTile = ({
  game,
  playable,
  live,
  boost,
  isFavorite,
  onOpen,
  onPlay,
  onFavorite,
}: PlayLauncherTileProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable
  const PlayIcon = ICONS.playResume
  const StarIcon = ICONS.playStar
  const label = isHidden ? PLAY_HUB_COPY.mystery : meta.label
  const style = { '--game': `var(${isHidden ? '--play-ink-soft' : meta.tone})` } as CSSProperties

  return (
    <article className={PLAY_LAUNCH.tile} style={style}>
      <PlayGameArt game={game} isHidden={isHidden} className={PLAY_LAUNCH.tileArt} />
      <span className={PLAY_LAUNCH.tileShade} aria-hidden="true" />
      <span className={PLAY_LAUNCH.tileGlow} aria-hidden="true" />
      {(live || boost !== null) && (
        <div className={PLAY_LAUNCH.tileTags}>
          {live && <span className={PLAY_LAUNCH.tileTag}>{PLAY_LAUNCHER_COPY.liveTag}</span>}
          {boost !== null && (
            <span className={PLAY_LAUNCH.tileVedette}>
              <StarIcon className={PLAY_LAUNCH.tileVedetteIcon} aria-hidden="true" />
              {boost > 0
                ? fillPlayMessage(PLAY_CONFIG_COPY.boostBadge, { percent: boost })
                : PLAY_CONFIG_COPY.vedette}
            </span>
          )}
        </div>
      )}
      <div className={PLAY_LAUNCH.tileText}>
        <h3 className={PLAY_LAUNCH.tileName}>{label}</h3>
        {!isHidden && (
          <p className={PLAY_LAUNCH.tileNote}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </p>
        )}
      </div>
      <PlayFaces people={live?.faces ?? []} className={PLAY_LAUNCH.tileFaces} />
      <button type="button" aria-label={label} className={PLAY_LAUNCH.tileOpen} onClick={onOpen} />
      {playable && (
        <>
          <button
            type="button"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? PLAY_LAUNCHER_COPY.unfavorite : PLAY_LAUNCHER_COPY.favorite}
            className={cn(PLAY_LAUNCH.tileStar, isFavorite && PLAY_LAUNCH.tileStarOn)}
            onClick={onFavorite}
          >
            <StarIcon className={PLAY_LAUNCH.tileStarIcon} aria-hidden="true" />
          </button>
          <AppLink
            href={ROUTES.playGame(meta.slug)}
            className={PLAY_LAUNCH.tilePlay}
            onClick={onPlay}
          >
            <PlayLinkLabel>
              <PlayIcon className={PLAY_LAUNCH.tilePlayIcon} aria-hidden="true" />
              {PLAY_LAUNCHER_COPY.play}
            </PlayLinkLabel>
          </AppLink>
        </>
      )}
    </article>
  )
}
