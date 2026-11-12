import { MYSTERY_SCENE, SCENES } from '@/composites/play/brand/poster/scenes'
import { HERO, Stage } from '@/composites/play/brand/poster/stage'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BRAND } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayPosterArtProps {
  game: PlayGameName
  // Keeps the game a secret
  isHidden?: boolean
  className?: string
}

/**
 * Tall poster illustration of a game, arcade box art
 * @param {PlayPosterArtProps} props - Game, secrecy and frame
 * @return {JSX.Element}
 */

export const PlayPosterArt = ({ game, isHidden, className }: PlayPosterArtProps) => {
  const meta = PLAY_GAMES.get(game)
  const tone = isHidden ? '--play-mystery' : meta.tone
  const id = isHidden ? 'play-poster-mystery' : `play-poster-${meta.slug}`

  return (
    <svg
      viewBox="0 0 360 480"
      preserveAspectRatio="xMidYMid slice"
      className={cn(PLAY_BRAND.art, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}-glow)` }} />
          <stop offset="0.45" style={{ stopColor: `var(${tone})` }} />
          <stop offset="1" style={{ stopColor: `var(${tone}-deep)` }} />
        </linearGradient>
      </defs>
      <rect width="360" height="480" fill={`url(#${id})`} />
      <Stage tone={tone} />
      <g transform={`translate(${HERO.x} ${HERO.y})`}>
        {isHidden ? MYSTERY_SCENE : SCENES[meta.backdrop]?.(meta.tone)}
      </g>
    </svg>
  )
}
