'use client'

import type { KeyboardEvent, PointerEvent } from 'react'

import { MODVIEW_WORKSPACE } from '@/declarations/ui/variants'

export interface SplitHandleProps {
  orientation: 'vertical' | 'horizontal'
  label: string
  // Pixels moved since the last call, positive towards the end
  onMove: (pixels: number) => void
}

// Pixels a key press moves
const KEY_STEP = 24

/**
 * Handle between two columns or two windows
 * @param {'vertical' | 'horizontal'} orientation - Line the handle draws
 * @param {string} label - Spoken name
 * @param {(pixels: number) => void} onMove - Movement handler
 * @return {JSX.Element}
 */

export const SplitHandle = ({ orientation, label, onMove }: SplitHandleProps) => {
  const isColumn = orientation === 'vertical'

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    let last = isColumn ? event.clientX : event.clientY

    const move = (next: globalThis.PointerEvent) => {
      const point = isColumn ? next.clientX : next.clientY
      onMove(point - last)
      last = point
    }
    const stop = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', stop)
      target.removeEventListener('pointercancel', stop)
    }

    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', stop)
    target.addEventListener('pointercancel', stop)
  }

  const press = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = isColumn ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']
    const index = keys.indexOf(event.key)
    if (index < 0) return

    event.preventDefault()
    onMove(index === 0 ? -KEY_STEP : KEY_STEP)
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      aria-label={label}
      className={isColumn ? MODVIEW_WORKSPACE.columnHandle : MODVIEW_WORKSPACE.rowHandle}
      onPointerDown={drag}
      onKeyDown={press}
    >
      <span className={isColumn ? MODVIEW_WORKSPACE.columnGrip : MODVIEW_WORKSPACE.rowGrip} />
    </div>
  )
}
