'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { APP_SHELL } from '@/declarations/ui/blocks'

// Smallest thumb share
const THUMB_MIN_SHARE = 0.08

// Track click jump
const PAGE_JUMP_SHARE = 0.9

export interface WindowFrameProps {
  // No rail beside it
  bare?: boolean
}

/**
 * Pink rim around the page
 * @param {boolean} [bare] - Rim on every side
 * @return {JSX.Element}
 */

export const WindowFrame = ({ bare }: WindowFrameProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const grab = useRef<{ y: number; scroll: number } | null>(null)

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return

    // Written on the node, never through state
    const place = () => {
      const root = document.documentElement
      const reach = root.scrollHeight - window.innerHeight
      const room = track.clientHeight

      track.hidden = reach <= 0
      if (reach <= 0) return

      const size = Math.max(room * (window.innerHeight / root.scrollHeight), room * THUMB_MIN_SHARE)
      thumb.style.height = `${size}px`
      thumb.style.transform = `translateY(${((room - size) * window.scrollY) / reach}px)`
    }

    // Follow page changes
    place()
    const observer = new ResizeObserver(place)
    observer.observe(document.body)
    window.addEventListener('scroll', place, { passive: true })
    window.addEventListener('resize', place)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', place)
      window.removeEventListener('resize', place)
    }
  }, [])

  // Page per thumb pixel
  const pagePerPixel = () => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return 0

    const reach = document.documentElement.scrollHeight - window.innerHeight

    return reach / Math.max(track.clientHeight - thumb.offsetHeight, 1)
  }

  const takeThumb = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    grab.current = { y: event.clientY, scroll: window.scrollY }
  }

  const dragThumb = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!grab.current) return
    window.scrollTo({
      top: grab.current.scroll + (event.clientY - grab.current.y) * pagePerPixel(),
    })
  }

  const dropThumb = () => {
    grab.current = null
  }

  // Track click turns a page
  const jump = (event: ReactPointerEvent<HTMLDivElement>) => {
    const thumb = thumbRef.current
    if (!thumb) return

    const isBelow = event.clientY > thumb.getBoundingClientRect().bottom
    window.scrollBy({
      top: (isBelow ? 1 : -1) * window.innerHeight * PAGE_JUMP_SHARE,
      behavior: 'smooth',
    })
  }

  return (
    <div aria-hidden="true" className={bare ? APP_SHELL.windowBare : APP_SHELL.window}>
      <div ref={trackRef} className={APP_SHELL.windowTrack} onPointerDown={jump}>
        <div
          ref={thumbRef}
          className={APP_SHELL.windowThumb}
          onPointerDown={takeThumb}
          onPointerMove={dragThumb}
          onPointerUp={dropThumb}
          onPointerCancel={dropThumb}
        />
      </div>
    </div>
  )
}
