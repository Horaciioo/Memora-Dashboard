import type { ReactNode } from 'react'

import { NEW_MARKS } from '@/composites/play/brand/logo/marks'
import { Tile } from '@/composites/play/brand/poster/scenes'
import { tint } from '@/composites/play/brand/poster/stage'

// Centre of the hero on the 640 × 320 canvas
const CENTER = { x: 470, y: 160 }

// Sparks around the hero
const SPARKS = [
  [600, 66, 11],
  [624, 92, 6],
  [584, 40, 6],
  [628, 46, 5],
]

// Fanned word tiles
const FAN = [
  { letter: 'J', angle: -18, dx: -100, dy: 22, size: 116, fill: '--play-jumble-tile' },
  { letter: 'M', angle: 16, dx: 100, dy: 22, size: 116, fill: '--play-jumble-glow' },
  { letter: 'U', angle: 0, dx: 0, dy: -24, size: 140, fill: '--play-gold' },
]

/**
 * Halo, floor shadow and sparks around a hero
 * @param {Object} props - Banner hero
 * @param {string} props.tone - Colour token
 * @param {ReactNode} props.children - Hero drawn around 0 0
 * @return {JSX.Element}
 */

const Hero = ({ tone, children }: { tone: string; children: ReactNode }) => (
  <>
    <circle cx={CENTER.x} cy={CENTER.y} r="170" {...tint(`${tone}-glow`, 0.18)} />
    <ellipse cx={CENTER.x} cy={CENTER.y + 128} rx="104" ry="12" fill="black" opacity="0.28" />
    <g transform={`translate(${CENTER.x} ${CENTER.y})`}>{children}</g>
    {SPARKS.map(([x, y, r]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={r} {...tint('--play-gold')} />
    ))}
  </>
)

/**
 * Hero drawn from the logo mark of a game
 * @param {Object} props - Mark
 * @param {string} props.tone - Colour token
 * @param {string} props.mark - Key in NEW_MARKS
 * @param {number} props.scale - Mark scale on the 64 grid
 * @return {JSX.Element}
 */

const MarkHero = ({ tone, mark, scale }: { tone: string; mark: string; scale: number }) => (
  <Hero tone={tone}>
    <g transform={`translate(${-32 * scale} ${-32 * scale}) scale(${scale})`}>{NEW_MARKS[mark]}</g>
  </Hero>
)

// Banner scenes of the games that have no wide drawing of their own
export const MARK_SCENES: Record<string, (tone: string) => ReactNode> = {
  cards: (tone) => <MarkHero tone={tone} mark="playEcho" scale={3.8} />,
  gallows: (tone) => <MarkHero tone={tone} mark="playSuspens" scale={3.8} />,
  sketch: (tone) => <MarkHero tone={tone} mark="playCroquis" scale={3.8} />,
  twins: (tone) => <MarkHero tone={tone} mark="playGlitch" scale={3.8} />,
  map: (tone) => <MarkHero tone={tone} mark="playConcordat" scale={4.2} />,
  tiles: (tone) => (
    <Hero tone={tone}>
      {FAN.map((tile) => (
        <g key={tile.letter} transform={`translate(${tile.dx} ${tile.dy}) rotate(${tile.angle})`}>
          <Tile
            letter={tile.letter}
            size={tile.size}
            fill={tile.fill}
            ink="--play-jumble-tile-ink"
          />
        </g>
      ))}
    </Hero>
  ),
}
