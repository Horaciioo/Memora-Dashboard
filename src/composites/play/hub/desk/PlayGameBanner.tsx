import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Featured game on the big screen: its art, name, pitch and the play key
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Featured game
 * @return {JSX.Element}
 */

export const PlayGameBanner = ({ game }: { game: PlayGameName }) => {
  const meta = PLAY_GAMES.get(game)

  return (
    <article className={PLAY_DESK.hero} style={{ '--game': `var(${meta.tone})` } as CSSProperties}>
      <PlayGameArt game={game} className={PLAY_DESK.heroArt} />
      <span className={PLAY_DESK.heroShade} aria-hidden="true" />
      <div className={PLAY_DESK.heroBody}>
        <span className={PLAY_DESK.heroKicker}>{PLAY_HUB_COPY.featureBadge}</span>
        <h3 className={PLAY_DESK.heroName}>{meta.label}</h3>
        <p className={PLAY_DESK.heroTagline}>{meta.tagline}</p>
        <div className={PLAY_DESK.heroFoot}>
          <span className={PLAY_DESK.heroPlay} aria-hidden="true">
            {PLAY_HUB_COPY.featurePlay}
          </span>
          <span className={PLAY_DESK.heroSeats}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </span>
        </div>
      </div>
      <AppLink
        href={ROUTES.playGame(meta.slug)}
        aria-label={`${PLAY_HUB_COPY.enter} ${meta.label}`}
        className={PLAY_DESK.cardLink}
      />
    </article>
  )
}
