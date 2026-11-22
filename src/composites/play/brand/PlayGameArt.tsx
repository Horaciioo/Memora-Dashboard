import { GAME_ARTS } from '@/composites/play/brand/gameArts'
import { PLAY_GAMES } from '@/declarations/play'
import { PLAY_BRAND } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

// Question marks scattered over a secret game
const MYSTERY_MARKS = [
  { x: 380, y: 120, size: 110, r: -12 },
  { x: 520, y: 210, size: 150, r: 10 },
  { x: 600, y: 80, size: 70, r: 18 },
  { x: 300, y: 260, size: 60, r: -6 },
]

/**
 * Scene of a game not announced yet
 * @return {JSX.Element}
 */

const mysteryScene = () => (
  <>
    {MYSTERY_MARKS.map((mark) => (
      <text
        key={`${mark.x}-${mark.y}`}
        x={mark.x}
        y={mark.y}
        textAnchor="middle"
        fontSize={mark.size}
        fontWeight="800"
        fill="white"
        opacity="0.16"
        transform={`rotate(${mark.r} ${mark.x} ${mark.y})`}
      >
        ?
      </text>
    ))}
  </>
)

export interface PlayGameArtProps {
  game: PlayGameName
  // Keeps the game a secret
  isHidden?: boolean
  className?: string
}

/**
 * Banner illustration of a game
 * @param {PlayGameArtProps} props - Game, secrecy and frame
 * @return {JSX.Element}
 */

export const PlayGameArt = ({ game, isHidden, className }: PlayGameArtProps) => {
  const meta = PLAY_GAMES.get(game)
  const tone = isHidden ? '--play-mystery' : meta.tone
  const id = isHidden ? 'play-art-mystery' : `play-art-${meta.slug}`
  const TileArt = isHidden ? undefined : GAME_ARTS[game]

  return (
    <svg
      viewBox="0 0 640 320"
      preserveAspectRatio="xMaxYMid slice"
      className={cn(PLAY_BRAND.art, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}-deep)` }} />
          <stop offset="0.6" style={{ stopColor: `var(${tone})` }} />
          <stop offset="1" style={{ stopColor: `var(${tone}-glow)` }} />
        </linearGradient>
      </defs>
      {TileArt ? (
        <TileArt frame="tile" />
      ) : (
        <>
          <rect width="640" height="320" fill={`url(#${id})`} />
          {mysteryScene()}
        </>
      )}
    </svg>
  )
}
