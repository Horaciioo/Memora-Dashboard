'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { StopGoCard } from '@/composites/play/stopgo/cards/StopGoCard'
import type { StopGoCardKey } from '@/declarations/play/stopgo/cards'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoDrawnProps {
  cardKey: StopGoCardKey
  // Slot the card ends in
  slotId: string
  // Wait before it shows, so several cards come one after another
  delayMs: number
  onDone: () => void
}

/**
 * Card just drawn, shown in the middle of the screen, then carried into its slot
 * @param {StopGoDrawnProps} props - Drawn card
 * @return {JSX.Element | null}
 */

export const StopGoDrawn = ({ cardKey, slotId, delayMs, onDone }: StopGoDrawnProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone)
  // Delay read once so a card landing before does not restart this flight
  const delayRef = useRef(delayMs)

  useEffect(() => {
    doneRef.current = onDone
  })

  useEffect(() => {
    const node = ref.current
    const box = document.querySelector(`[data-stopgo-slot="${slotId}"]`)?.getBoundingClientRect()
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || !box || isReduced) return doneRef.current()

    const at = (x: number, y: number, scale: number, turn: number) =>
      `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${scale}) rotate(${turn}deg)`
    const mid = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const end = { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    const hold = STOPGO_SETTINGS.revealMs
    const fly = STOPGO_SETTINGS.drawMs
    const total = hold + fly
    const run = node.animate(
      [
        { transform: at(mid.x, mid.y + 60, 0.5, -8), opacity: 0 },
        { transform: at(mid.x, mid.y, 1.7, 0), opacity: 1, offset: 0.2 * (hold / total) },
        { transform: at(mid.x, mid.y, 1.7, 0), opacity: 1, offset: hold / total },
        { transform: at(end.x, end.y, 1, 0), opacity: 1 },
      ],
      {
        duration: total,
        delay: delayRef.current,
        easing: 'cubic-bezier(0.3, 0.7, 0.3, 1)',
        fill: 'both',
      }
    )
    run.onfinish = () => doneRef.current()

    return () => run.cancel()
  }, [slotId])

  return createPortal(
    <div ref={ref} className={STOPGO_HAND.drawn} aria-hidden>
      <StopGoCard cardKey={cardKey} isPlayable />
    </div>,
    document.body
  )
}
