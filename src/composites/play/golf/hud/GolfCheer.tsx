'use client'

import { useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'

import { cheerSparks } from '@/composites/play/golf/hud/cheerSparks'
import { GolfTrophy } from '@/composites/play/golf/hud/GolfTrophy'
import { playPowerChime } from '@/composites/play/golf/sound'
import { useGolfCheerStore } from '@/core/store/golfCheer'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_BOARD } from '@/declarations/ui/variants'

/**
 * Victory of an own ball holed: flash, turning rays, trophy slam and flying squares
 * @return {JSX.Element | null}
 */

export const GolfCheer = () => {
  const { cheer, clear } = useGolfCheerStore()
  const sparks = useMemo(() => cheerSparks(), [])

  // Fanfare, gone after a moment
  useEffect(() => {
    if (!cheer) return
    playPowerChime()
    const timer = window.setTimeout(clear, GOLF_SCENE.cheerMs)

    return () => window.clearTimeout(timer)
  }, [cheer, clear])

  if (!cheer) return null
  const isAce = cheer.strokes === 1

  return (
    <div
      className={GOLF_BOARD.cheer}
      style={{ '--cheer-ms': `${GOLF_SCENE.cheerMs}ms` } as CSSProperties}
      aria-live="polite"
    >
      <span key={`flash-${cheer.at}`} className={GOLF_BOARD.cheerFlash} />
      <div key={cheer.at} className={GOLF_BOARD.cheerStage}>
        <span className={GOLF_BOARD.cheerRays} />
        {sparks.map((style, index) => (
          <span key={index} className={GOLF_BOARD.cheerSpark} style={style} />
        ))}
        <div className={GOLF_BOARD.cheerCard}>
          <GolfTrophy className={GOLF_BOARD.cheerTrophy} />
          <span className={GOLF_BOARD.cheerText}>
            {isAce ? GOLF_BOARD_COPY.ace : GOLF_BOARD_COPY.holed}
          </span>
          {!isAce && (
            <span className={GOLF_BOARD.cheerGap}>
              {fillPlayMessage(GOLF_BOARD_COPY.holedIn, { count: cheer.strokes })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
