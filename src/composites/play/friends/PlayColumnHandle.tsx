'use client'

import type { KeyboardEvent, PointerEvent } from 'react'

import { PLAY_HANDLE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Keyboard step, px
const STEP = 16

export interface PlayColumnHandleProps {
  edge: 'left' | 'right'
  width: number
  min: number
  max: number
  label: string
  onResize: (width: number) => void
}

/**
 * Drag edge that resizes a column in width
 * @param {PlayColumnHandleProps} props - Edge, bounds, change
 * @return {JSX.Element}
 */

export const PlayColumnHandle = ({
  edge,
  width,
  min,
  max,
  label,
  onResize,
}: PlayColumnHandleProps) => {
  const clamp = (value: number) => Math.min(max, Math.max(min, Math.round(value)))
  // A right edge grows with the pointer, a left edge against it
  const sign = edge === 'right' ? 1 : -1

  const start = (event: PointerEvent<HTMLDivElement>) => {
    const handle = event.currentTarget
    const column = handle.parentElement
    const from = event.clientX
    const base = width
    handle.setPointerCapture(event.pointerId)
    handle.dataset.drag = ''
    if (column) column.dataset.drag = ''

    const move = (next: globalThis.PointerEvent) =>
      onResize(clamp(base + sign * (next.clientX - from)))
    const end = () => {
      delete handle.dataset.drag
      if (column) delete column.dataset.drag
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }

    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

    event.preventDefault()
    const dir = event.key === 'ArrowRight' ? 1 : -1
    onResize(clamp(width + sign * dir * STEP))
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      className={cn(PLAY_HANDLE.base, edge === 'right' ? PLAY_HANDLE.right : PLAY_HANDLE.left)}
      onPointerDown={start}
      onKeyDown={key}
    />
  )
}
