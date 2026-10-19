'use client'

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { createPortal } from 'react-dom'

import { MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import { MODVIEW_INSPECT } from '@/declarations/ui/variants'

export interface FocusBannerProps {
  name: string
  actInPlace: boolean
  onActInPlace: (value: boolean) => void
}

/**
 * Flame around the page and the small Focus box of a moderator followed
 * @param {string} name - Moderator followed
 * @param {boolean} actInPlace - Gestures noted in their place
 * @param {(value: boolean) => void} onActInPlace - Switch handler
 * @return {JSX.Element}
 */

export const FocusBanner = ({ name, actInPlace, onActInPlace }: FocusBannerProps) => {
  // The box is taken and moved anywhere on the page
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const grab = useRef<{ x: number; y: number } | null>(null)

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('label')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    grab.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }
  }

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (grab.current) {
      setOffset({ x: event.clientX - grab.current.x, y: event.clientY - grab.current.y })
    }
  }

  // Above every window, whatever wraps the Mod View
  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className={MODVIEW_INSPECT.frame} aria-hidden="true">
        <div className={MODVIEW_INSPECT.glow} />
        <svg
          className={MODVIEW_INSPECT.svg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="focus-flame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--focus-tone)" />
              <stop offset="0.5" stopColor="var(--focus-tone-soft)" />
              <stop offset="1" stopColor="var(--focus-tone)" />
            </linearGradient>
          </defs>
          {/* Both halves leave the top centre and meet at the bottom centre */}
          <path className="focus-line" pathLength={100} d="M50 0H100V100H50" />
          <path className="focus-line" pathLength={100} d="M50 0H0V100H50" />
        </svg>
      </div>
      <div
        className={MODVIEW_INSPECT.dock}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (grab.current = null)}
      >
        <div className={MODVIEW_INSPECT.box} role="status">
          <span className={MODVIEW_INSPECT.boxTitle}>
            {MODVIEW_INSPECT_COPY.following.replace('{name}', name)}
          </span>
          <label className={MODVIEW_INSPECT.boxToggle}>
            <input
              type="checkbox"
              checked={actInPlace}
              onChange={(event) => onActInPlace(event.target.checked)}
            />
            {MODVIEW_INSPECT_COPY.actInPlace}
          </label>
        </div>
      </div>
    </>,
    document.body
  )
}
