'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { usePathname } from 'next/navigation'

import { buildEntryPixels, pixelMotion } from '@/composites/play/entry/entryPixels'
import { PLAY_ENTRY, PLAY_ENTRY_BAR, PLAY_ENTRY_TIMING } from '@/declarations/play/entry'

// Entering Play from anywhere else
const PLAY_PREFIX = '/play'

/**
 * Arcade entry: the square logo drops in block by block, a bar fills, the blocks pop away
 * @return {JSX.Element | null}
 */

export const PlayEntry = () => {
  const pathname = usePathname()
  const [isOpen, setOpen] = useState(false)
  const wasInPlay = useRef<boolean | null>(null)
  const { pixels, cols, rows } = useMemo(() => buildEntryPixels(), [])

  // Open on entering Play
  useEffect(() => {
    const isInPlay = pathname.startsWith(PLAY_PREFIX)
    const was = wasInPlay.current

    wasInPlay.current = isInPlay

    const isFresh = was === null && !document.documentElement.dataset.splash

    if (isInPlay && (was === false || isFresh)) setOpen(true)
  }, [pathname])

  // Close when the show ends
  useEffect(() => {
    if (!isOpen) return

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(
      () => setOpen(false),
      isReduced ? PLAY_ENTRY_TIMING.reducedMs : PLAY_ENTRY_TIMING.totalMs
    )

    return () => window.clearTimeout(timer)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={PLAY_ENTRY.overlay} aria-hidden="true" onClick={() => setOpen(false)}>
      <div className={PLAY_ENTRY.stage} style={{ '--cols': cols, '--rows': rows } as CSSProperties}>
        {pixels.map(({ x, y, tone, shade }) => (
          <span
            key={`${x}-${y}`}
            className={PLAY_ENTRY.pixel}
            data-tone={tone}
            data-shade={shade}
            style={{ '--x': x, '--y': y, ...pixelMotion(x, y) } as CSSProperties}
          />
        ))}
      </div>
      <div className={PLAY_ENTRY.bar}>
        {Array.from({ length: PLAY_ENTRY_BAR }, (_, index) => (
          <span key={index} className={PLAY_ENTRY.cell} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>
    </div>
  )
}
