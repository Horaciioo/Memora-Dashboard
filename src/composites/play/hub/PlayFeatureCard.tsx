'use client'

import { useState } from 'react'

import { PlayPosterArt } from '@/composites/play/brand/PlayPosterArt'
import { PLAY_CONCEPT } from '@/declarations/play/concept'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_FEATURE } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayFeatureCardProps {
  game: PlayGameName
}

/**
 * Poster card of the banner, its back says how the game plays
 * @param {PlayFeatureCardProps} props - Game
 * @return {JSX.Element}
 */

export const PlayFeatureCard = ({ game }: PlayFeatureCardProps) => {
  const [isFlipped, setFlipped] = useState(false)
  const meta = PLAY_GAMES.get(game)

  return (
    <button
      type="button"
      className={PLAY_FEATURE.poster}
      aria-pressed={isFlipped}
      aria-label={meta.label}
      onClick={() => setFlipped((value) => !value)}
    >
      <span className={PLAY_FEATURE.flip} data-flipped={isFlipped}>
        <span className={PLAY_FEATURE.front} aria-hidden="true">
          <PlayPosterArt game={game} />
        </span>
        <span className={PLAY_FEATURE.back}>
          <span className={PLAY_FEATURE.backTitle}>{meta.label}</span>
          {PLAY_CONCEPT[game].map((step) => (
            <span key={step.title} className={PLAY_FEATURE.backStep}>
              <strong>{step.title}</strong>
              {step.text}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}
