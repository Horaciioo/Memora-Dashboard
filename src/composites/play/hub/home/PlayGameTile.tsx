import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayFaces } from '@/composites/play/hub/PlayFaces'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_HOME } from '@/declarations/ui/variants'
import type { PlayPerson } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameTileProps {
  game: PlayGameName
  playable: boolean
  onLocked: () => void
  // Players sitting at this game now
  faces: PlayPerson[]
}

/**
 * Game tile: art edge to edge, name over it, a play key on hover
 * @param {PlayGameTileProps} props - Game
 * @return {JSX.Element}
 */

export const PlayGameTile = ({ game, playable, onLocked, faces }: PlayGameTileProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable
  const PlayIcon = ICONS.playResume
  const style = { '--game': `var(${isHidden ? '--play-ink-soft' : meta.tone})` } as CSSProperties
  const label = isHidden ? PLAY_HUB_COPY.mystery : meta.label

  return (
    <article className={PLAY_HOME.card} style={style}>
      <PlayGameArt game={game} isHidden={isHidden} className={PLAY_HOME.cardArt} />
      <span className={PLAY_HOME.cardShade} aria-hidden="true" />
      {playable && (
        <span className={PLAY_HOME.cardPlay} aria-hidden="true">
          <PlayIcon className={PLAY_HOME.cardPlayIcon} />
        </span>
      )}
      <div className={PLAY_HOME.cardText}>
        <h3 className={PLAY_HOME.cardName}>{label}</h3>
        {!isHidden && (
          <p className={PLAY_HOME.cardNote}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </p>
        )}
      </div>
      <PlayFaces people={faces} className={PLAY_HOME.cardFaces} />
      {playable ? (
        <AppLink
          href={ROUTES.playGame(meta.slug)}
          aria-label={`${PLAY_HUB_COPY.enter} ${meta.label}`}
          className={PLAY_HOME.cardLink}
        />
      ) : (
        <button
          type="button"
          aria-label={PLAY_HUB_COPY.mystery}
          className={PLAY_HOME.cardLink}
          onClick={onLocked}
        />
      )}
    </article>
  )
}
