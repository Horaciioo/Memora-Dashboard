import { BombBody, BombPrintDefs, BombRays, BombStamp } from '@/composites/play/bomb/art/bombPrint'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { BOMB_PRINT } from '@/declarations/play/bomb/art'

const ID = 'bomb-card'

export interface BombCardArtProps {
  // Upright card or wide launcher tile
  frame?: GameArtFrame
}

/**
 * Game card of Bomb Party, the hub poster reframed
 * @param {BombCardArtProps} props - Frame
 * @return {JSX.Element}
 */

export const BombCardArt = ({ frame = 'card' }: BombCardArtProps) => {
  const { size, bomb, fuse, rays, spark, stamp } = BOMB_PRINT[frame]
  const id = `${ID}-${frame}`

  return (
    <>
      <defs>
        <BombPrintDefs id={id} />
      </defs>
      <rect width={size.width} height={size.height} style={{ fill: 'var(--play-bomb-stock)' }} />
      <BombRays x={bomb.x} y={bomb.y} reach={700} count={rays} />
      <BombStamp {...stamp} />
      <path
        d={fuse}
        fill="none"
        style={{ stroke: 'var(--play-bomb-cord)' }}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <BombBody id={id} {...bomb} />
      <g transform={`translate(${spark.x} ${spark.y})`}>
        <circle r="20" style={{ fill: 'var(--play-bomb)' }} opacity="0.4" />
        <path
          d="M0 -17L4 -4L17 0L4 4L0 17L-4 4L-17 0L-4 -4Z"
          style={{ fill: 'var(--play-bomb-glow)' }}
        />
      </g>
    </>
  )
}
