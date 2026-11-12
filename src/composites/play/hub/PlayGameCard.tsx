import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayGameCardProps {
  game: PlayGameName
  playable: boolean
  onLocked?: () => void
  className?: string
}

/**
 * One game card, an upcoming game kept secret
 * @param {PlayGameCardProps} props - Game
 * @return {JSX.Element}
 */

export const PlayGameCard = ({ game, playable, onLocked, className }: PlayGameCardProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable
  const style = { '--game': `var(${isHidden ? '--play-ink-soft' : meta.tone})` } as CSSProperties

  return (
    <article className={cn(PLAY_HUB.card, className)} style={style}>
      <PlayPosterArt game={game} isHidden={isHidden} />
      <span className={PLAY_HUB.cardShade} aria-hidden="true" />

      <div className={PLAY_HUB.cardBody}>
        <h3 className={PLAY_HUB.cardName}>{isHidden ? PLAY_HUB_COPY.mystery : meta.label}</h3>
        {!isHidden && (
          <p className={PLAY_HUB.cardSeats}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </p>
        )}
      </div>

      {playable ? (
        <AppLink
          href={ROUTES.playGame(meta.slug)}
          aria-label={`${PLAY_HUB_COPY.enter} ${meta.label}`}
          className={PLAY_HUB.cardLink}
        />
      ) : (
        <button
          type="button"
          aria-label={PLAY_HUB_COPY.mystery}
          className={PLAY_HUB.cardLink}
          onClick={onLocked}
        />
      )}
    </article>
  )
}
