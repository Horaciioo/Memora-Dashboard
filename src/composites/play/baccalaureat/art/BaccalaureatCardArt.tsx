import { BacLetter, BacSheet } from '@/composites/play/baccalaureat/art/bacSheet'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { BAC_BANNER } from '@/declarations/play/baccalaureat/banner'

/**
 * Game card of Baccalauréat, a corner of the filled sheet
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const BaccalaureatCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const size = GAME_ART_FRAMES[frame]
  const { letter, words, fontSize, margin } = BAC_BANNER.card
  const isTile = frame === 'tile'
  const left = isTile ? 300 : margin + 24

  return (
    <>
      <BacSheet {...size} ruling={24} margin={isTile ? 250 : margin} />
      <BacLetter
        x={isTile ? 200 : margin / 2}
        y={isTile ? 96 : 92}
        letter={letter}
        size={isTile ? 54 : 44}
      />
      <g
        style={{ fill: 'var(--play-baccalaureat-ink)', fontFamily: 'var(--font-hand)' }}
        fontSize={fontSize}
      >
        {words.map((word, index) => (
          <text
            key={word}
            x={left}
            y={(isTile ? 72 : 84) + index * (isTile ? 48 : 72)}
            transform={`rotate(-2 ${left} 0)`}
          >
            {word}
          </text>
        ))}
      </g>
      <text
        x={size.width - 30}
        y={isTile ? 66 : 300}
        textAnchor="end"
        fontSize={fontSize * 1.1}
        fontWeight="700"
        style={{ fill: 'var(--bac-margin)', fontFamily: 'var(--font-hand)' }}
      >
        +30
      </text>
    </>
  )
}
