'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'

import { useSplash } from '@/core/hooks/interaction/layout/useSplash'
import { BRAIN_PIECES, BRAIN_RATIO, BRAIN_REACH } from '@/declarations/ui/brain'
import { SPLASH } from '@/declarations/ui/blocks'

/**
 * Brand screen over the first load: the lobes fly in and lock, the membranes stretch while it loads, then they burst and an iris opens on the app
 * @return {JSX.Element | null}
 */

export const BrandSplash = () => {
  const { phase, skip } = useSplash()

  if (phase === 'done') return null

  return (
    <div className={SPLASH.overlay} data-phase={phase} aria-hidden="true" onClick={skip}>
      <div className={SPLASH.ground}>
        <span />
        <span />
      </div>
      <div className={SPLASH.stage}>
        <span className={SPLASH.halo} />
        <div className={SPLASH.brain} style={{ aspectRatio: BRAIN_RATIO }}>
          {BRAIN_PIECES.map((piece, index) => (
            <span
              key={piece.src}
              className={SPLASH.piece}
              style={
                {
                  '--x': BRAIN_REACH[index].x,
                  '--y': BRAIN_REACH[index].y,
                  '--o': BRAIN_REACH[index].order,
                  left: `${piece.left}%`,
                  top: `${piece.top}%`,
                  width: `${piece.width}%`,
                  height: `${piece.height}%`,
                } as CSSProperties
              }
            >
              <Image src={piece.src} alt="" fill unoptimized priority sizes="50vw" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
