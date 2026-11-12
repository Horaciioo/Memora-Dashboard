'use client'

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { GlitchItemArt } from '@/composites/play/glitch/GlitchShapes'
import type { GlitchItem, GlitchMark } from '@/core/lib/play/glitch'
import { GLITCH_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface GlitchPictureProps {
  items: GlitchItem[]
  width: number
  height: number
  caption: string
  // Differences the viewer found, ringed in gold
  found: GlitchMark[]
  // Differences nobody found, shown once the round is over
  missed: GlitchMark[]
  isLocked: boolean
  // Click handler, absent when the picture is shut
  onSpot?: (x: number, y: number) => void
}

/**
 * One of the two pictures: its elements, the rings and the clicks
 * @param {GlitchPictureProps} props - Picture
 * @return {JSX.Element}
 */

export const GlitchPicture = ({
  items,
  width,
  height,
  caption,
  found,
  missed,
  isLocked,
  onSpot,
}: GlitchPictureProps) => {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([])
  const count = useRef(0)

  const spot = (event: PointerEvent<SVGSVGElement>) => {
    if (!onSpot) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * width
    const y = ((event.clientY - box.top) / box.height) * height
    count.current += 1
    setBursts((previous) => [...previous, { id: count.current, x, y }])
    onSpot(x, y)
  }

  return (
    <figure className={GLITCH_BOARD.slot}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn(
          GLITCH_BOARD.picture,
          onSpot && GLITCH_BOARD.pictureOpen,
          isLocked && GLITCH_BOARD.pictureLocked
        )}
        role="img"
        aria-label={caption}
        onPointerDown={spot}
      >
        {items.map((item) => (
          <GlitchItemArt key={item.id} item={item} />
        ))}
        {found.map((mark) => (
          <circle
            key={`f${mark.x}-${mark.y}`}
            className={GLITCH_BOARD.ring}
            cx={mark.x}
            cy={mark.y}
            r={mark.r}
          />
        ))}
        {missed.map((mark) => (
          <circle
            key={`m${mark.x}-${mark.y}`}
            className={GLITCH_BOARD.ringMissed}
            cx={mark.x}
            cy={mark.y}
            r={mark.r}
          />
        ))}
        {bursts.map((burst) => (
          <circle
            key={burst.id}
            className={GLITCH_BOARD.burst}
            cx={burst.x}
            cy={burst.y}
            r="4"
            onAnimationEnd={() =>
              setBursts((previous) => previous.filter((entry) => entry.id !== burst.id))
            }
          />
        ))}
      </svg>
      <figcaption className={GLITCH_BOARD.caption}>{caption}</figcaption>
    </figure>
  )
}
