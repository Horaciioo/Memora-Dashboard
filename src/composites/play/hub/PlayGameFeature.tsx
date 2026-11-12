'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { PlayFeatureCard } from '@/composites/play/hub/PlayFeatureCard'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_FEATURE } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

// Time on each featured game, ms
const TURN = 6000

export interface PlayGameFeatureProps {
  games: PlayGameName[]
}

/**
 * Wide banner on top of the game row, the new games taking turns
 * @param {PlayGameFeatureProps} props - Featured games
 * @return {JSX.Element | null}
 */

export const PlayGameFeature = ({ games }: PlayGameFeatureProps) => {
  const [at, setAt] = useState(0)
  const [isPaused, setPaused] = useState(false)

  useEffect(() => {
    if (isPaused || games.length < 2) return
    const timer = setInterval(() => setAt((index) => (index + 1) % games.length), TURN)
    return () => clearInterval(timer)
  }, [isPaused, games.length])

  const game = games[at % games.length]
  if (!game) return null
  const meta = PLAY_GAMES.get(game)

  return (
    <section
      className={PLAY_FEATURE.root}
      style={{ '--game': `var(${meta.tone})` } as CSSProperties}
      aria-label={PLAY_HUB_COPY.featureTitle}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div key={game} className={PLAY_FEATURE.slide}>
        <PlayPosterArt game={game} className={PLAY_FEATURE.backdrop} />
        <span className={PLAY_FEATURE.shade} aria-hidden="true" />
        <div className={PLAY_FEATURE.body}>
          <h2 className={PLAY_FEATURE.name}>{meta.label}</h2>
          <p className={PLAY_FEATURE.tagline}>{meta.tagline}</p>
          <p className={PLAY_FEATURE.seats}>
            {fillPlayMessage(PLAY_HUB_COPY.seats, { min: meta.minPlayers, max: meta.maxPlayers })}
          </p>
          <AppLink href={ROUTES.playGame(meta.slug)} className={PLAY_FEATURE.play}>
            {PLAY_HUB_COPY.featurePlay}
          </AppLink>
        </div>
      </div>
      <PlayFeatureCard key={`${game}-poster`} game={game} />
      <span className={PLAY_FEATURE.badgeClip} aria-hidden="true">
        <span className={PLAY_FEATURE.badge}>{PLAY_HUB_COPY.featureBadge}</span>
      </span>
      {games.length > 1 && (
        <div className={PLAY_FEATURE.dots}>
          {games.map((entry, index) => (
            <button
              key={entry}
              type="button"
              aria-label={PLAY_GAMES.label(entry)}
              aria-current={index === at % games.length}
              className={PLAY_FEATURE.dot}
              onClick={() => setAt(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
