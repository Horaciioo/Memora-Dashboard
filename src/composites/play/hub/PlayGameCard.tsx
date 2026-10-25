import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayGameCardProps {
  game: PlayGameName
  playable: boolean
  isWaiting: boolean
  className?: string
}

/**
 * One game card, an upcoming game kept secret
 * @param {PlayGameCardProps} props - Game
 * @return {JSX.Element}
 */

export const PlayGameCard = ({ game, playable, isWaiting, className }: PlayGameCardProps) => {
  const meta = PLAY_GAMES.get(game)
  const isHidden = !playable

  return (
    <article className={cn(PLAY_HUB.card, className)}>
      <PlayGameArt game={game} isHidden={isHidden} />
      <span className={PLAY_HUB.cardShade} aria-hidden="true" />
      <span className={cn(PLAY_HUB.ribbon, playable ? PLAY_HUB.ribbonLive : PLAY_HUB.ribbonMuted)}>
        {playable ? PLAY_HUB_COPY.featured : PLAY_HUB_COPY.soon}
      </span>

      <div className={PLAY_HUB.cardBody}>
        <PlayGameLogo game={game} isHidden={isHidden} className={PLAY_HUB.cardLogo} />
        <div className={PLAY_HUB.cardText}>
          <h3 className={PLAY_HUB.cardName}>{isHidden ? PLAY_HUB_COPY.mystery : meta.label}</h3>
          <p className={PLAY_HUB.cardTagline}>
            {isHidden ? PLAY_HUB_COPY.mysteryTagline : meta.tagline}
          </p>
          {playable && (
            <p className={PLAY_HUB.cardMeta}>
              <span className={PLAY_HUB.chip}>
                {fillPlayMessage(PLAY_HUB_COPY.seats, {
                  min: meta.minPlayers,
                  max: meta.maxPlayers,
                })}
              </span>
              {isWaiting && <span className={PLAY_HUB.chip}>{PLAY_HUB_COPY.waiting}</span>}
            </p>
          )}
        </div>
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
