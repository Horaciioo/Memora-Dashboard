import { useMemo } from 'react'

import { pixelEdgeSquares } from '@/composites/play/golf/hud/pixelEdge'
import { GOLF_SCORECARD } from '@/declarations/ui/variants'

/**
 * Stray squares, each its own tone
 * @return {JSX.Element}
 */

export const GolfPixelEdge = () => {
  const squares = useMemo(() => pixelEdgeSquares(), [])

  return (
    <span className={GOLF_SCORECARD.edge} aria-hidden="true">
      {squares.map((style, index) => (
        <span key={index} className={GOLF_SCORECARD.square} style={style} />
      ))}
    </span>
  )
}
