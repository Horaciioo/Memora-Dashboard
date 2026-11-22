import { JumbleCase, JumbleDefs, JumbleSort } from '@/composites/play/jumble/art/jumbleCase'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { JUMBLE_BANNER } from '@/declarations/play/jumble/banner'

/**
 * Game card of Jumble, the composing stick still in a muddle
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const JumbleCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const size = GAME_ART_FRAMES[frame]
  const { stick, sortSize } = JUMBLE_BANNER.frames[frame]
  const id = `jumble-${frame}`
  const step = stick.size * 1.08

  return (
    <>
      <defs>
        <JumbleDefs id={id} />
      </defs>
      <JumbleCase id={id} {...size} sortSize={sortSize} />
      <rect
        x={stick.x - step * 0.2}
        y={stick.y - stick.size * 0.75}
        width={step * 6.4}
        height={stick.size * 1.6}
        rx="6"
        style={{ fill: 'var(--jumble-metal-deep)' }}
      />
      {JUMBLE_BANNER.word.split('').map((letter, index) => (
        <g
          key={letter}
          transform={`translate(${stick.x + step * (JUMBLE_BANNER.orders[0][index] + 0.5)} ${stick.y})`}
        >
          <JumbleSort id={id} letter={letter} size={stick.size} />
        </g>
      ))}
    </>
  )
}
