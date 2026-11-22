'use client'

import type { PointerEvent } from 'react'
import { PixelArt } from '@/components/elements/display/PixelArt'
import Link from '@/components/elements/navigation/AppLink'
import { pixelWordRows } from '@/core/lib/play/pixelWord'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play/hub'
import { PLAY_HOME_COPY } from '@/declarations/play'
import { PIXEL_BRAIN } from '@/declarations/play/pixelArt'
import { railIcon } from '@/declarations/ui/railIcons'
import { PLAY_NOTICE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

const PlayIcon = railIcon('play')

// Wordmark rows, built once
const WORD = pixelWordRows(PLAY_HOME_COPY.brand.toUpperCase())

const CELL = 8
const BURST = 4
const SPREAD = 4

/**
 * Drop a burst of squares around the pointer, snapped to the grid
 * @param {PointerEvent<HTMLAnchorElement>} event - Pointer move
 */

const sparkle = (event: PointerEvent<HTMLAnchorElement>) => {
  const box = event.currentTarget
  const rect = box.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / CELL)
  const y = Math.floor((event.clientY - rect.top) / CELL)
  if (box.dataset.cell === `${x}:${y}`) return
  box.dataset.cell = `${x}:${y}`
  for (let i = 0; i < BURST; i += 1) {
    const dx = Math.round((Math.random() - 0.5) * SPREAD * 2)
    const dy = Math.round((Math.random() - 0.5) * SPREAD * 2)
    const spark = document.createElement('span')
    spark.className = 'play-notice-spark'
    spark.dataset.tone = String(Math.floor(Math.random() * 3))
    spark.style.cssText = `left:${(x + dx) * CELL}px;top:${(y + dy) * CELL}px;width:${CELL}px;height:${CELL}px;animation-delay:${i * 40}ms`
    spark.addEventListener('animationend', () => spark.remove())
    box.append(spark)
  }
}

/**
 * Sunset box under the shortcuts, always on, leads to Play
 * @param {Object} props - Box
 * @param {boolean} [props.isCompact] - Folded rail, glyph only
 * @return {JSX.Element}
 */

export const PlayNotice = ({ isCompact }: { isCompact?: boolean }) => {
  return (
    <div className={PLAY_NOTICE.wrap}>
      <Link
        href={ROUTES.play}
        aria-label={PLAY_HUB_COPY.noticeTitle}
        title={PLAY_HUB_COPY.noticeTitle}
        onPointerMove={isCompact ? undefined : sparkle}
        className={cn(PLAY_NOTICE.bubble, isCompact && PLAY_NOTICE.bubbleCompact)}
      >
        {isCompact ? (
          <PlayIcon className={PLAY_NOTICE.icon} aria-hidden="true" />
        ) : (
          <span className={PLAY_NOTICE.text}>
            <span className={PLAY_NOTICE.logo}>
              <PixelArt rows={PIXEL_BRAIN} className={PLAY_NOTICE.brandMark} />
              <span className={PLAY_NOTICE.title}>
                <PixelArt rows={WORD} className={PLAY_NOTICE.brandName} />
              </span>
            </span>
          </span>
        )}
      </Link>
    </div>
  )
}
