import { MarkArt } from '@/composites/play/brand/poster/MarkArt'
import { tint } from '@/composites/play/brand/poster/stage'
import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import { STOPGO_MARK } from '@/composites/play/stopgo/art/StopGoMark'
import { StopGoRoadStrip } from '@/composites/play/stopgo/art/StopGoRoadStrip'
import type { GameArtFrame } from '@/declarations/play/artFrames'

// Wide tile, a car on a bend between two lawns
const ROAD_TILE = (
  <>
    <path d="M0 250C140 214 300 232 640 196V320H0z" {...tint('--stopgo-grass')} />
    <path d="M0 290C200 262 400 280 640 250V320H0z" {...tint('--stopgo-grass-deep')} />
    <g transform="translate(0 6) scale(1 0.9)">
      <StopGoRoadStrip path="M250 420V250A70 70 0 0 1 320 180H700" width={74} />
      <g transform="translate(400 180) rotate(90) scale(1.1)">
        <StopGoCarShape color="red" />
      </g>
    </g>
  </>
)

/**
 * Game card of Stop & Go, the red single-seater
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const StopGoCardArt = ({ frame }: { frame: GameArtFrame }) => (
  <MarkArt
    frame={frame}
    id={`stopgo-${frame}`}
    tone="--play-stopgo"
    mark={STOPGO_MARK}
    scale={3.8}
    tile={ROAD_TILE}
  />
)
