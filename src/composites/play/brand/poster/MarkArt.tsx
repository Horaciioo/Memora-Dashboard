import type { ReactNode } from 'react'

import { HERO, Sparks, Stage, tint } from '@/composites/play/brand/poster/stage'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'

// Centre of the hero on the wide tile
const CENTER = { x: 470, y: 160 }

// Sparks on the wide tile
const TILE_SPARKS = [
  [600, 66, 11],
  [624, 92, 6],
  [584, 40, 6],
  [628, 46, 5],
]

export interface MarkArtProps {
  frame: GameArtFrame
  id: string
  // Colour token of the game
  tone: string
  // Logo mark drawn on the 64 grid
  mark: ReactNode
  scale: number
  // Replaces the mark on the wide tile
  tile?: ReactNode
}

/**
 * Card or tile of a game built from its logo mark on the game gradient
 * @param {MarkArtProps} props - Frame, tone, mark and scale
 * @return {JSX.Element}
 */

export const MarkArt = ({ frame, id, tone, mark, scale, tile }: MarkArtProps) => {
  const { width, height } = GAME_ART_FRAMES[frame]
  const isCard = frame === 'card'
  const hero = <g transform={`translate(${-32 * scale} ${-32 * scale}) scale(${scale})`}>{mark}</g>

  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2={isCard ? '0.4' : '1'} y2="1">
          <stop offset="0" style={{ stopColor: `var(${tone}${isCard ? '-glow' : '-deep'})` }} />
          <stop offset={isCard ? '0.45' : '0.6'} style={{ stopColor: `var(${tone})` }} />
          <stop offset="1" style={{ stopColor: `var(${tone}${isCard ? '-deep' : '-glow'})` }} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
      {isCard ? (
        <>
          <Stage tone={tone} />
          <g transform={`translate(${HERO.x} ${HERO.y})`}>{hero}</g>
          <g transform={`translate(${HERO.x} ${HERO.y})`}>
            <Sparks />
          </g>
        </>
      ) : (
        <>
          <circle cx={CENTER.x} cy={CENTER.y} r="170" {...tint(`${tone}-glow`, 0.18)} />
          <ellipse cx={CENTER.x} cy={CENTER.y + 128} rx="104" ry="12" fill="black" opacity="0.28" />
          {tile ?? <g transform={`translate(${CENTER.x} ${CENTER.y})`}>{hero}</g>}
          {TILE_SPARKS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} {...tint('--play-gold')} />
          ))}
        </>
      )}
    </>
  )
}
