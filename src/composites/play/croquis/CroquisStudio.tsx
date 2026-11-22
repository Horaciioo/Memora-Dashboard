'use client'

import { useState } from 'react'

import { backgroundOf } from '@/composites/play/croquis/canvasPaint'
import { CroquisCanvas, eraserPen } from '@/composites/play/croquis/CroquisCanvas'
import { useStrokeQueue } from '@/composites/play/croquis/useStrokeQueue'
import type { CroquisStroke } from '@/core/lib/play/croquis/strokes'
import {
  CROQUIS_BOARD_COPY,
  CROQUIS_COLORS,
  CROQUIS_FIRST_PEN,
  CROQUIS_SIZES,
  CROQUIS_TOOLS,
} from '@/declarations/play'
import type { CroquisTool } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Pens and nibs offered, the paper itself is the eraser
const PENS = CROQUIS_COLORS.map((color, index) => ({ ...color, index })).slice(CROQUIS_FIRST_PEN)

// Every colour, the paper included, for a background change
const SWATCHES = CROQUIS_COLORS.map((color, index) => ({ ...color, index }))

// Nibs from thin to thick, kept with their stored index
const NIBS = CROQUIS_SIZES.map((nib, index) => ({ nib, index })).sort((a, b) => a.nib - b.nib)

// Drawing size of a nib dot in the picker, in rem
const dotRem = (size: number): string => `${0.2 + size * 0.03}rem`

/**
 * Drawer's side of the paper: the strokes live here first, then travel to the table
 * @param {Object} props - Studio
 * @param {string} props.sessionId - Game
 * @param {CroquisStroke[]} props.initial - Strokes already on the paper
 * @param {boolean} props.isOpen - Round still running
 * @return {JSX.Element}
 */

export const CroquisStudio = ({
  sessionId,
  initial,
  isOpen,
}: {
  sessionId: string
  initial: CroquisStroke[]
  isOpen: boolean
}) => {
  const queue = useStrokeQueue(sessionId)
  const [strokes, setStrokes] = useState(initial)
  const [color, setColor] = useState<number>(CROQUIS_FIRST_PEN)
  const [size, setSize] = useState(1)
  const [tool, setTool] = useState<CroquisTool>('pen')
  const isEraser = tool === 'eraser'
  const isBackground = tool === 'background'
  const paper = backgroundOf(strokes)
  const swatches = isBackground ? SWATCHES : PENS

  const put = (index: number, stroke: CroquisStroke, isFinal: boolean) => {
    setStrokes((previous) => [...previous.slice(0, index), stroke, ...previous.slice(index + 1)])
    queue({ type: 'stroke', index, stroke }, isFinal)
  }

  const undo = () => {
    setStrokes((previous) => previous.slice(0, -1))
    queue({ type: 'undo' })
  }

  const clear = () => {
    setStrokes([])
    queue({ type: 'clear' })
  }

  return (
    <div className={CROQUIS_BOARD.stage}>
      <CroquisCanvas
        strokes={strokes}
        pen={
          isOpen && !isBackground
            ? isEraser
              ? eraserPen(size)
              : { color, size, shape: tool === 'pen' ? undefined : tool }
            : null
        }
        onStroke={put}
      />
      <div className={CROQUIS_BOARD.tools} role="toolbar" aria-label={CROQUIS_BOARD_COPY.palette}>
        <div className={CROQUIS_BOARD.toolPens}>
          {swatches.map((pen) => (
            <button
              key={pen.key}
              type="button"
              aria-label={pen.label}
              aria-pressed={isBackground ? paper === pen.index : !isEraser && color === pen.index}
              disabled={!isOpen}
              className={cn(
                CROQUIS_BOARD.pen,
                (isBackground ? paper === pen.index : !isEraser && color === pen.index) &&
                  CROQUIS_BOARD.penOn
              )}
              style={{ background: `var(${pen.token})` }}
              onClick={() => {
                if (isBackground) {
                  put(strokes.length, { c: pen.index, w: 0, f: 1, p: [0, 0] }, true)

                  return
                }
                setColor(pen.index)
                if (isEraser) setTool('pen')
              }}
            />
          ))}
        </div>
        <div className={CROQUIS_BOARD.toolSizes} role="group" aria-label={CROQUIS_BOARD_COPY.sizes}>
          {NIBS.map(({ nib, index }) => (
            <button
              key={index}
              type="button"
              aria-label={`${CROQUIS_BOARD_COPY.sizes} ${nib}`}
              aria-pressed={size === index}
              disabled={!isOpen}
              className={cn(CROQUIS_BOARD.size, size === index && CROQUIS_BOARD.sizeOn)}
              onClick={() => setSize(index)}
            >
              <span
                className={CROQUIS_BOARD.sizeDot}
                style={{ width: dotRem(nib), height: dotRem(nib) }}
              />
            </button>
          ))}
        </div>
        <div
          className={CROQUIS_BOARD.toolShapes}
          role="group"
          aria-label={CROQUIS_BOARD_COPY.tools}
        >
          {CROQUIS_TOOLS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              aria-pressed={tool === entry.key}
              disabled={!isOpen}
              className={cn(CROQUIS_BOARD.action, tool === entry.key && CROQUIS_BOARD.actionOn)}
              onClick={() => setTool(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className={CROQUIS_BOARD.toolActions}>
          <button
            type="button"
            disabled={!isOpen || strokes.length === 0}
            className={CROQUIS_BOARD.action}
            onClick={undo}
          >
            {CROQUIS_BOARD_COPY.undo}
          </button>
          <button
            type="button"
            disabled={!isOpen || strokes.length === 0}
            className={CROQUIS_BOARD.action}
            onClick={clear}
          >
            {CROQUIS_BOARD_COPY.clear}
          </button>
        </div>
      </div>
    </div>
  )
}
