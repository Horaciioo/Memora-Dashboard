import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameTileProps {
  game: PlayGameName
  playable: boolean
  onLocked: () => void
}

/**
 * Game card of the desktop hub, wide art over its name, an upcoming game kept secret
 * @param {PlayGameTileProps} props - Game
 * @return {JSX.Element}
 */

export const PlayGameTile = ({ game, playable, onLocked }: PlayGameTileProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable
  const style = { '--game': `var(${isHidden ? '--play-ink-soft' : meta.tone})` } as CSSProperties

  return (
    <article className={PLAY_DESK.card} style={style}>
      <div className={PLAY_DESK.cardMedia}>
        <PlayGameArt game={game} isHidden={isHidden} className={PLAY_DESK.cardArt} />
      </div>
      <div className={PLAY_DESK.cardText}>
        <h3 className={PLAY_DESK.cardName}>{isHidden ? PLAY_HUB_COPY.mystery : meta.label}</h3>
        {!isHidden && (
          <p className={PLAY_DESK.cardNote}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </p>
        )}
      </div>
      {playable ? (
        <AppLink
          href={ROUTES.playGame(meta.slug)}
          aria-label={`${PLAY_HUB_COPY.enter} ${meta.label}`}
          className={PLAY_DESK.cardLink}
        />
      ) : (
        <button
          type="button"
          aria-label={PLAY_HUB_COPY.mystery}
          className={PLAY_DESK.cardLink}
          onClick={onLocked}
        />
      )}
    </article>
  )
}
