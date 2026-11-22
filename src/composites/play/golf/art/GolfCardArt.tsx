import { GolfLinks } from '@/composites/play/golf/art/golfLinks'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { GOLF_BANNER } from '@/declarations/play/golf/banner'

/**
 * Game card of Golf, the links at sunset with the shot traced in the sky
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const GolfCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const id = `golf-${frame}`
  const [x, y, width, height] = GOLF_BANNER.frames[frame].viewBox.split(' ').map(Number)
  const size = frame === 'card' ? { w: 360, h: 480 } : { w: 640, h: 320 }

  return (
    <g transform={`scale(${size.w / width} ${size.h / height}) translate(${-x} ${-y})`}>
      <GolfLinks
        id={id}
        tracer={
          <path
            d={GOLF_BANNER.flight}
            fill="none"
            style={{ stroke: 'var(--golf-tracer)' }}
            strokeWidth="6"
            strokeLinecap="round"
            filter={`url(#${id}-glow)`}
          />
        }
      />
    </g>
  )
}
