'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'

import { paintDrawing } from '@/composites/play/croquis/canvasPaint'
import type { CroquisPen } from '@/composites/play/croquis/types'
import type { CroquisStroke } from '@/core/lib/play/croquis/strokes'
import {
  CROQUIS_BOARD_COPY,
  CROQUIS_PAPER,
  CROQUIS_PEN,
  CROQUIS_SETTINGS,
} from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CroquisCanvasProps {
  strokes: CroquisStroke[]
  // Pen in hand, none for a reader
  pen: CroquisPen | null
  // A stroke started or grew, the last call of a stroke is final
  onStroke?: (index: number, stroke: CroquisStroke, isFinal: boolean) => void
}

// Number of points in a drawing
const pointsIn = (strokes: CroquisStroke[]): number =>
  strokes.reduce((sum, entry) => sum + entry.p.length / 2, 0)

/**
 * Paper of the table: shows the strokes and, with a pen, takes new ones
 * @param {CroquisCanvasProps} props - Drawing and pen
 * @return {JSX.Element}
 */

export const CroquisCanvas = ({ strokes, pen, onStroke }: CroquisCanvasProps) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const current = useRef<{ index: number; stroke: CroquisStroke } | null>(null)
  const { width, height } = CROQUIS_SETTINGS.canvas

  useEffect(() => {
    if (canvas.current) paintDrawing(canvas.current, strokes)
  }, [strokes])

  // Position of a pointer in drawing units
  const pointOf = (event: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const box = event.currentTarget.getBoundingClientRect()

    return [
      Math.round(((event.clientX - box.left) / box.width) * width),
      Math.round(((event.clientY - box.top) / box.height) * height),
    ]
  }

  const begin = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pen || !onStroke || pointsIn(strokes) >= CROQUIS_SETTINGS.limits.points) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const [x, y] = pointOf(event)
    const started = { c: pen.color, w: pen.size, p: [x, y] }
    current.current = { index: strokes.length, stroke: started }
    onStroke(strokes.length, started, false)
  }

  const extend = (event: PointerEvent<HTMLCanvasElement>) => {
    const live = current.current
    if (!live || !onStroke) return
    const [x, y] = pointOf(event)
    const { p } = live.stroke
    const gap = Math.hypot(x - p[p.length - 2], y - p[p.length - 1])
    if (gap < CROQUIS_PEN.minStep) return
    if (p.length / 2 >= CROQUIS_SETTINGS.limits.pointsPerStroke) return

    live.stroke = { ...live.stroke, p: [...p, x, y] }
    onStroke(live.index, live.stroke, false)
  }

  const end = () => {
    const live = current.current
    current.current = null
    if (live && onStroke) onStroke(live.index, live.stroke, true)
  }

  return (
    <div className={CROQUIS_BOARD.paper}>
      <canvas
        ref={canvas}
        width={width * CROQUIS_PEN.scale}
        height={height * CROQUIS_PEN.scale}
        className={cn(CROQUIS_BOARD.canvas, pen && CROQUIS_BOARD.canvasDraw)}
        onPointerDown={begin}
        onPointerMove={extend}
        onPointerUp={end}
        onPointerCancel={end}
        role="img"
        aria-label={CROQUIS_BOARD_COPY.blank}
      />
      {strokes.length === 0 && !pen && (
        <span className={CROQUIS_BOARD.blank}>{CROQUIS_BOARD_COPY.blank}</span>
      )}
    </div>
  )
}

// Eraser pen, the paper colour
export const eraserPen = (size: number): CroquisPen => ({ color: CROQUIS_PAPER, size })
