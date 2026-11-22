import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { PlayFaces } from '@/composites/play/hub/PlayFaces'
import { PlayLinkLabel } from '@/composites/play/loading/PlayLoadingLabel'
import { PlayFeatureCard } from '@/composites/play/hub/PlayFeatureCard'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_FEATURE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayPerson } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayGameFeatureProps {
  games: PlayGameName[]
  // Slides one after the other
  isCarousel?: boolean
  // Players sitting at each game now
  faces?: Partial<Record<PlayGameName, PlayPerson[]>>
}

/**
 * Banners on top of the games
 * @param {PlayGameFeatureProps} props - Featured games and layout
 * @return {JSX.Element | null}
 */

export const PlayGameFeature = ({ games, isCarousel, faces = {} }: PlayGameFeatureProps) => {
  if (games.length === 0) return null

  return (
    <section
      className={isCarousel ? PLAY_FEATURE.carousel : PLAY_FEATURE.root}
      aria-label={PLAY_HUB_COPY.featureTitle}
    >
      {games.map((game) => {
        const meta = PLAY_GAMES.get(game)

        return (
          <div
            key={game}
            className={cn(PLAY_FEATURE.item, isCarousel && PLAY_FEATURE.slideItem)}
            style={{ '--game': `var(${meta.tone})` } as CSSProperties}
          >
            <div className={PLAY_FEATURE.slide}>
              <PlayPosterArt game={game} className={PLAY_FEATURE.backdrop} />
              <span className={PLAY_FEATURE.shade} aria-hidden="true" />
              <div className={PLAY_FEATURE.body}>
                <h2 className={PLAY_FEATURE.name}>{meta.label}</h2>
                <p className={PLAY_FEATURE.seats}>
                  {fillPlayMessage(PLAY_HUB_COPY.seats, {
                    min: meta.minPlayers,
                    max: meta.maxPlayers,
                  })}
                </p>
                <div className={PLAY_FEATURE.actions}>
                  <AppLink href={ROUTES.playGame(meta.slug)} className={PLAY_FEATURE.play}>
                    <PlayLinkLabel>{PLAY_HUB_COPY.featurePlay}</PlayLinkLabel>
                  </AppLink>
                  <PlayFaces people={faces[game] ?? []} />
                </div>
              </div>
            </div>
            <PlayFeatureCard game={game} />
          </div>
        )
      })}
    </section>
  )
}
