'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { CONFETTI_LIFETIME_MS, confettiBurst } from '@/core/lib/play/confetti'
import type { ConfettiPiece } from '@/core/lib/play/confetti'
import { PLAY_CONFETTI_UI } from '@/declarations/ui/variants'

// Reduced motion keeps the podium still
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * One burst of confetti falling over the page
 * @return {JSX.Element | null}
 */

export const PlayConfetti = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  // Thrown once on the client, swept when the last piece has landed
  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return
    const start = window.setTimeout(() => setPieces(confettiBurst()), 0)
    const end = window.setTimeout(() => setPieces([]), CONFETTI_LIFETIME_MS)

    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
    }
  }, [])

  if (pieces.length === 0) return null

  return (
    <div className={PLAY_CONFETTI_UI.layer} aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={PLAY_CONFETTI_UI.piece}
          style={
            {
              '--x': piece.x,
              '--w': piece.width,
              '--h': piece.height,
              '--tone': piece.tone,
              '--dur': piece.duration,
              '--delay': piece.delay,
              '--drift': piece.drift,
              '--spin': piece.spin,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
