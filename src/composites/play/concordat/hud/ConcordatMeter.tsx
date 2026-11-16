'use client'

import { useEffect, useRef, useState } from 'react'

import type { ConcordatClientState } from '@/core/lib/play/concordat'
import { useConcordatMeterStore } from '@/core/store/play/concordatMeter'
import { fillPlayMessage } from '@/declarations/play/copy'
import { CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'
import { CONCORDAT_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Window of one measure
const SAMPLE_MS = 1000
// Share of the nominal speed under which the game counts as slow
const SLOW_RATIO = 0.8

interface Reading {
  ticks: number
  frames: number
}

// Counts frames and ticks, one state change per second, nothing while closed
const Readout = ({ client }: { client: ConcordatClientState }) => {
  const [reading, setReading] = useState<Reading | null>(null)
  const latest = useRef(client)

  useEffect(() => {
    latest.current = client
  })

  useEffect(() => {
    let frames = 0
    let frame = window.requestAnimationFrame(function count() {
      frames++
      frame = window.requestAnimationFrame(count)
    })
    let from = performance.now()
    let tick = latest.current.tick
    const timer = window.setInterval(() => {
      const now = performance.now()
      const seconds = (now - from) / 1000
      const current = latest.current.tick
      setReading({ ticks: (current - tick) / seconds, frames: frames / seconds })
      from = now
      tick = current
      frames = 0
    }, SAMPLE_MS)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(timer)
    }
  }, [])

  const ratio = reading ? reading.ticks / CONCORDAT_TICKS_PER_SECOND : 1
  const isSlow = ratio < SLOW_RATIO

  return (
    <div className={CONCORDAT_HUD.meter} role="status" aria-live="off">
      <div className={CONCORDAT_HUD.meterRow}>
        <span className={CONCORDAT_HUD.statCaption}>{CONCORDAT_HUD_COPY.meterSpeed}</span>
        <span className={cn(CONCORDAT_HUD.meterFigure, isSlow && CONCORDAT_HUD.meterSlow)}>
          {reading
            ? fillPlayMessage(CONCORDAT_HUD_COPY.meterTicks, { value: reading.ticks.toFixed(1) })
            : CONCORDAT_HUD_COPY.meterNone}
        </span>
      </div>
      <div className={CONCORDAT_HUD.meterRow}>
        <span className={CONCORDAT_HUD.statCaption}>{CONCORDAT_HUD_COPY.meterFrames}</span>
        <span className={CONCORDAT_HUD.meterFigure}>
          {reading
            ? fillPlayMessage(CONCORDAT_HUD_COPY.meterFps, { value: Math.round(reading.frames) })
            : CONCORDAT_HUD_COPY.meterNone}
        </span>
      </div>
      {isSlow && reading && (
        <span className={CONCORDAT_HUD.meterNote}>{CONCORDAT_HUD_COPY.meterSlow}</span>
      )}
    </div>
  )
}

/**
 * Speed readout: ticks and frames per second, measured only while open
 * @param {Object} props - Game
 * @param {ConcordatClientState} props.client - Live game
 * @return {JSX.Element | null}
 */

export const ConcordatMeter = ({ client }: { client: ConcordatClientState }) => {
  const isOpen = useConcordatMeterStore((state) => state.isOpen)

  return isOpen ? <Readout client={client} /> : null
}
