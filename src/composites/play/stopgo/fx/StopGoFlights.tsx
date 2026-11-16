'use client'

import { useEffect, useRef } from 'react'

import { StopGoCard, StopGoCardBack } from '@/composites/play/stopgo/cards/StopGoCard'
import type { StopGoFlight } from '@/composites/play/stopgo/fx/useStopGoFx'
import { STOPGO_FX_ANCHORS, STOPGO_FX_STYLES } from '@/declarations/ui/variants/games/play/stopgo'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

export interface StopGoFlightsProps {
  flights: StopGoFlight[]
  viewerId: string
  onLand: (id: string) => void
}

// Edge kept free around a point
const MARGIN = 48

/**
 * Centre of an element, held inside the window when the camera is elsewhere
 * @param {string} selector - Anchor
 * @return {{ x: number, y: number } | null} - Point
 */

const centreOf = (selector: string): { x: number; y: number } | null => {
  const box = document.querySelector(selector)?.getBoundingClientRect()
  if (!box) return null
  const clamp = (value: number, size: number) => Math.min(Math.max(value, MARGIN), size - MARGIN)

  return {
    x: clamp(box.left + box.width / 2, window.innerWidth),
    y: clamp(box.top + box.height / 2, window.innerHeight),
  }
}

/**
 * Where a flight leaves from: the hand for me, the panel or the car of someone else
 * @param {StopGoFlight} flight - Flight
 * @param {string} viewerId - Reader
 * @return {{ x: number, y: number } | null} - Point
 */

const originOf = ({ kind, fromId }: StopGoFlight, viewerId: string) => {
  if (kind === 'toDiscard') return centreOf(STOPGO_FX_ANCHORS.car(fromId))
  if (fromId === viewerId) return centreOf(STOPGO_FX_ANCHORS.hand)

  return centreOf(STOPGO_FX_ANCHORS.car(fromId))
}

/**
 * One card in flight, leaves, lands, and goes
 * @param {Object} props - Flight
 * @return {JSX.Element}
 */

const Flight = ({
  flight,
  viewerId,
  onLand,
}: {
  flight: StopGoFlight
  viewerId: string
  onLand: (id: string) => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    const from = originOf(flight, viewerId)
    const to =
      flight.kind === 'toDiscard'
        ? centreOf(STOPGO_FX_ANCHORS.discard)
        : centreOf(STOPGO_FX_ANCHORS.car(flight.toId))
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || !from || !to || isReduced) return onLand(flight.id)

    const at = (point: { x: number; y: number }, scale: number, turn: number) =>
      `translate(calc(${point.x}px - 50%), calc(${point.y}px - 50%)) scale(${scale}) rotate(${turn}deg)`
    const run = node.animate(
      [
        { transform: at(from, 0.7, -6), opacity: 0 },
        { transform: at(from, 0.85, -4), opacity: 1, offset: 0.15 },
        { transform: at(to, 0.55, 8), opacity: 1, offset: 0.85 },
        { transform: at(to, 0.3, 14), opacity: 0 },
      ],
      { duration: STOPGO_SETTINGS.flightMs, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' }
    )
    run.onfinish = () => onLand(flight.id)

    return () => run.cancel()
  }, [flight, viewerId, onLand])

  return (
    <div ref={ref} className={STOPGO_FX_STYLES.flight} aria-hidden>
      {flight.card ? <StopGoCard cardKey={flight.card} isPlayable /> : <StopGoCardBack />}
    </div>
  )
}

/**
 * Layer over the race where played cards cross the screen
 * @param {StopGoFlightsProps} props - Flights
 * @return {JSX.Element}
 */

export const StopGoFlights = ({ flights, viewerId, onLand }: StopGoFlightsProps) => (
  <div className={STOPGO_FX_STYLES.layer} aria-hidden>
    {flights.map((flight) => (
      <Flight key={flight.id} flight={flight} viewerId={viewerId} onLand={onLand} />
    ))}
  </div>
)
