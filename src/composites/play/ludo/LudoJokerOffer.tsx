import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoJokerArt } from '@/composites/play/ludo/LudoJokerArt'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_CHAOS } from '@/declarations/play/ludo/chaos'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_CHAOS_COPY, LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_JOKER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Spin and vanish length, matches the CSS
const SPIN_MS = 600

export interface LudoJokerOfferProps {
  malus: LudoEffectName
  // Share of the turn clock left
  clock: number
  isSaving: boolean
  onAnswer: (isUsed: boolean) => void
}

/**
 * Joker card at the centre: tap spins it away, red text below takes the malus
 * @param {LudoJokerOfferProps} props - Offer
 * @return {JSX.Element}
 */

export const LudoJokerOffer = ({ malus, clock, isSaving, onAnswer }: LudoJokerOfferProps) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const copy = LUDO_CHAOS_COPY[malus]
  const text = fillPlayMessage(copy.text, {
    turns: malus === 'faulty' ? LUDO_CHAOS.faultyTurns : LUDO_CHAOS.blindTurns,
    max: LUDO_CHAOS.faultyMax,
  })

  useEffect(() => {
    if (!isSpinning) return
    const timer = window.setTimeout(() => onAnswer(true), SPIN_MS)
    return () => window.clearTimeout(timer)
  }, [isSpinning, onAnswer])

  const isLocked = isSaving || isSpinning

  return (
    <div className={LUDO_JOKER.offer} role="alertdialog" aria-label={LUDO_CHAOS_UI.offerLead}>
      <button
        type="button"
        className={cn(LUDO_JOKER.card, isSpinning && LUDO_JOKER.cardOut)}
        disabled={isLocked}
        aria-label={LUDO_CHAOS_UI.play}
        onClick={() => setIsSpinning(true)}
      >
        <span className={LUDO_JOKER.corner}>{LUDO_CHAOS_UI.joker}</span>
        <span className={LUDO_JOKER.glyph}>
          <LudoChaosGlyph name={malus} />
        </span>
        <LudoJokerArt className={LUDO_JOKER.art} />
        <span className={LUDO_JOKER.lead}>{LUDO_CHAOS_UI.offerLead}</span>
        <span className={LUDO_JOKER.name}>{copy.name}</span>
        <span className={LUDO_JOKER.text}>{text}</span>
        <span className={LUDO_JOKER.hint}>{LUDO_CHAOS_UI.play}</span>
        <span className={LUDO_JOKER.clock} style={{ '--left': clock } as CSSProperties} />
      </button>
      <button
        type="button"
        className={LUDO_JOKER.endure}
        disabled={isLocked}
        onClick={() => onAnswer(false)}
      >
        {LUDO_CHAOS_UI.endure}
      </button>
    </div>
  )
}
