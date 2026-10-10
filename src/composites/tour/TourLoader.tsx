'use client'

import { useEffect, useState } from 'react'

import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_DECK } from '@/declarations/ui/variants'

export interface TourLoaderProps {
  onReady: () => void
}

/**
 * The visit getting ready: a bar that fills, then the word that it is
 * @param {TourLoaderProps} props - Ready handler
 * @return {JSX.Element}
 */

export const TourLoader = ({ onReady }: TourLoaderProps) => {
  const [isReady, setReady] = useState(false)
  const [isFilling, setFilling] = useState(false)

  // Start filling on the next frame so the bar animates
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilling(true))
    const timer = window.setTimeout(() => {
      setReady(true)
      onReady()
    }, TOUR_SETTINGS.loadingMs)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [onReady])

  return (
    <div className={TOUR_DECK.loader} role="status">
      <div className={TOUR_DECK.loaderTrack}>
        <div
          className={TOUR_DECK.loaderFill}
          style={{
            transform: `scaleX(${isFilling ? 1 : 0})`,
            transitionDuration: `${TOUR_SETTINGS.loadingMs}ms`,
          }}
        />
      </div>
      <p className={TOUR_DECK.loaderText}>{isReady ? TOUR_COPY.loaded : TOUR_COPY.loading}</p>
    </div>
  )
}
