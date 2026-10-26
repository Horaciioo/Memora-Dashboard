import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayGameCardProps {
  game: PlayGameName
  playable: boolean
  className?: string
}

/**
 * One game card, an upcoming game kept secret
 * @param {PlayGameCardProps} props - Game
 * @return {JSX.Element}
 */

export const PlayGameCard = ({ game, playable, className }: PlayGameCardProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable

  return (
    <article className={cn(PLAY_HUB.card, className)}>
      <PlayPosterArt game={game} isHidden={isHidden} />
      <span className={PLAY_HUB.cardShade} aria-hidden="true" />

      <div className={PLAY_HUB.cardBody}>
        <h3 className={PLAY_HUB.cardName}>{isHidden ? PLAY_HUB_COPY.mystery : meta.label}</h3>
        <p className={PLAY_HUB.cardTagline}>
          {isHidden ? PLAY_HUB_COPY.mysteryTagline : meta.tagline}
        </p>
      </div>

      {playable && (
        <AppLink
          href={ROUTES.playGame(meta.slug)}
          aria-label={`${PLAY_HUB_COPY.enter} ${meta.label}`}
          className={PLAY_HUB.cardLink}
        />
      )}
    </article>
  )
}
