import { MarkArt } from '@/composites/play/brand/poster/MarkArt'
import { DIRECTION_MARKS } from '@/composites/play/brand/logo/directionMarks'
import type { GameArtFrame } from '@/declarations/play/artFrames'

/**
 * Game card of Concordat, the globe on its stand
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const ConcordatCardArt = ({ frame }: { frame: GameArtFrame }) => (
  <MarkArt
    frame={frame}
    id={`concordat-${frame}`}
    tone="--play-concordat"
    mark={DIRECTION_MARKS.playConcordat}
    scale={4.2}
  />
)
