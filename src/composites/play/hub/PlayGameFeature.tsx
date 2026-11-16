import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { PlayFeatureCard } from '@/composites/play/hub/PlayFeatureCard'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_FEATURE } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameFeatureProps {
  games: PlayGameName[]
}

/**
 * Banners on top of the games, the new games side by side
 * @param {PlayGameFeatureProps} props - Featured games
 * @return {JSX.Element | null}
 */

export const PlayGameFeature = ({ games }: PlayGameFeatureProps) => {
  if (games.length === 0) return null

  return (
    <section className={PLAY_FEATURE.root} aria-label={PLAY_HUB_COPY.featureTitle}>
      {games.map((game) => {
        const meta = PLAY_GAMES.get(game)

        return (
          <div
            key={game}
            className={PLAY_FEATURE.item}
            style={{ '--game': `var(${meta.tone})` } as CSSProperties}
          >
            <div className={PLAY_FEATURE.slide}>
              <PlayPosterArt game={game} className={PLAY_FEATURE.backdrop} />
              <span className={PLAY_FEATURE.shade} aria-hidden="true" />
              <div className={PLAY_FEATURE.body}>
                <span className={PLAY_FEATURE.pill}>{PLAY_HUB_COPY.featureBadge}</span>
                <h2 className={PLAY_FEATURE.name}>{meta.label}</h2>
                <p className={PLAY_FEATURE.tagline}>{meta.tagline}</p>
                <p className={PLAY_FEATURE.seats}>
                  {fillPlayMessage(PLAY_HUB_COPY.seats, {
                    min: meta.minPlayers,
                    max: meta.maxPlayers,
                  })}
                </p>
                <AppLink href={ROUTES.playGame(meta.slug)} className={PLAY_FEATURE.play}>
                  {PLAY_HUB_COPY.featurePlay}
                </AppLink>
              </div>
            </div>
            <PlayFeatureCard game={game} />
            <span className={PLAY_FEATURE.badgeClip} aria-hidden="true">
              <span className={PLAY_FEATURE.badge}>{PLAY_HUB_COPY.featureBadge}</span>
            </span>
          </div>
        )
      })}
    </section>
  )
}
