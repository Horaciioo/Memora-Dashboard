'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { usePlayBusyStore } from '@/core/store/play/playBusy'
import { APP_ASSETS } from '@/declarations/app'
import { PLAY_BUSY } from '@/declarations/play'
import { PLAY_BUSY_STYLES } from '@/declarations/ui/variants'

/**
 * Moving Memora logo while a Play gesture waits on the server
 * @return {JSX.Element | null}
 */

export const PlayBusyBadge = () => {
  const label = usePlayBusyStore((state) => state.labels.at(-1) ?? null)
  // Quick answers never flash the card
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (!label) {
      const timer = window.setTimeout(() => setShown(null), 0)

      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setShown(label), PLAY_BUSY.delayMs)

    return () => window.clearTimeout(timer)
  }, [label])

  if (!shown) return null
  // Inside the stage so the browser full screen keeps showing it
  const host = document.querySelector('[data-play-stage]') ?? document.body

  return createPortal(
    <div className={PLAY_BUSY_STYLES.card} role="status" aria-live="polite">
      <Image
        src={APP_ASSETS.brain}
        alt=""
        width={32}
        height={32}
        className={PLAY_BUSY_STYLES.logo}
      />
      <span className={PLAY_BUSY_STYLES.label}>
        {shown}
        <span className={PLAY_BUSY_STYLES.dots} aria-hidden="true">
          <span className={PLAY_BUSY_STYLES.dot}>.</span>
          <span className={PLAY_BUSY_STYLES.dot}>.</span>
          <span className={PLAY_BUSY_STYLES.dot}>.</span>
        </span>
      </span>
    </div>,
    host
  )
}
