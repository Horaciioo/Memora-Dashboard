'use client'

import { useEffect, useRef, useState } from 'react'

import { fillPlayMessage } from '@/declarations/play/copy'
import type { StopGoHazard } from '@/declarations/play/stopgo/cards'
import { STOPGO_CARD_COPY, STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

// Time the sign stays up
const HIT_SHOW_MS = 4200

export interface StopGoHitCueProps {
  hazards: StopGoHazard[]
}

/**
 * Sign naming the malus my car just took
 * @param {StopGoHitCueProps} props - My malus in play
 * @return {JSX.Element | null} - Nothing until a new malus lands
 */

export const StopGoHitCue = ({ hazards }: StopGoHitCueProps) => {
  const seen = useRef<StopGoHazard[] | null>(null)
  const [hit, setHit] = useState<{ hazard: StopGoHazard; no: number } | null>(null)

  useEffect(() => {
    const before = seen.current
    seen.current = hazards
    const fresh = before ? hazards.find((hazard) => !before.includes(hazard)) : undefined
    if (!fresh) return
    setHit((current) => ({ hazard: fresh, no: (current?.no ?? 0) + 1 }))
    const timer = globalThis.setTimeout(() => setHit(null), HIT_SHOW_MS)

    return () => globalThis.clearTimeout(timer)
  }, [hazards])

  if (!hit) return null

  return (
    <div key={hit.no} className={STOPGO_HAND.cueHit} role="alert">
      <b>
        {fillPlayMessage(STOPGO_HAND_COPY.hitTitle, { name: STOPGO_CARD_COPY[hit.hazard].name })}
      </b>
      <span>{STOPGO_CARD_COPY[hit.hazard].hint}</span>
    </div>
  )
}
