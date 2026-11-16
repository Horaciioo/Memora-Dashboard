'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { pointAt } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_BOARD_COPY } from '@/declarations/play/stopgo/track'

export interface StopGoProgressProps {
  scroller: RefObject<HTMLDivElement | null>
  plan: StopGoTrackPlan
  // Top of the drawing and its height, in board units
  viewTop: number
  viewHeight: number
  cars: { id: string; km: number; color: StopGoCarColor }[]
}

/**
 * Thin column of the whole race with every car and the part in view, a touch moves the camera
 * @param {StopGoProgressProps} props - Race
 * @return {JSX.Element}
 */

export const StopGoProgress = ({
  scroller,
  plan,
  viewTop,
  viewHeight,
  cars,
}: StopGoProgressProps) => {
  const [seen, setSeen] = useState({ from: 0, to: 1 })

  useEffect(() => {
    const box = scroller.current
    if (!box) return
    let frame = 0
    const read = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        setSeen({
          from: box.scrollTop / box.scrollHeight,
          to: (box.scrollTop + box.clientHeight) / box.scrollHeight,
        })
      )
    }
    read()
    box.addEventListener('scroll', read, { passive: true })
    const watch = new ResizeObserver(read)
    watch.observe(box)

    return () => {
      cancelAnimationFrame(frame)
      box.removeEventListener('scroll', read)
      watch.disconnect()
    }
  }, [scroller])

  const goTo = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = scroller.current
    if (!box) return
    const rect = event.currentTarget.getBoundingClientRect()
    const share = (event.clientY - rect.top) / rect.height
    box.scrollTo({ top: share * box.scrollHeight - box.clientHeight / 2, behavior: 'smooth' })
  }

  return (
    <div
      role="img"
      aria-label={STOPGO_BOARD_COPY.progress}
      className="absolute inset-y-6 right-0 z-10 w-3 cursor-pointer touch-none rounded-full bg-black/25 before:absolute before:-inset-x-3 before:inset-y-0 before:content-[''] max-md:top-24 max-md:bottom-[calc(var(--stopgo-dock-h,10rem)+6.5rem)]"
      onPointerDown={goTo}
    >
      <div
        className="absolute inset-x-0 rounded-full bg-white/45"
        style={{ top: `${seen.from * 100}%`, height: `${(seen.to - seen.from) * 100}%` }}
      />
      {cars.map(({ id, km, color }) => (
        <span
          key={id}
          className="absolute left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            top: `${((pointAt(plan, km, 0).y - viewTop) / viewHeight) * 100}%`,
            background: `var(--stopgo-car-${color})`,
          }}
        />
      ))}
    </div>
  )
}
