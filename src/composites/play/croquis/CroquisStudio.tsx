'use client'

import { useState } from 'react'

import { CroquisCanvas, eraserPen } from '@/composites/play/croquis/CroquisCanvas'
import { useStrokeQueue } from '@/composites/play/croquis/useStrokeQueue'
import type { CroquisStroke } from '@/core/lib/play/croquis/strokes'
import {
  CROQUIS_BOARD_COPY,
  CROQUIS_COLORS,
  CROQUIS_FIRST_PEN,
  CROQUIS_SIZES,
} from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Pens and nibs offered, the paper itself is the eraser
const PENS = CROQUIS_COLORS.map((color, index) => ({ ...color, index })).slice(CROQUIS_FIRST_PEN)

// Drawing size of a nib dot in the picker, in rem
const dotRem = (size: number): string => `${0.3 + size * 0.03}rem`

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
  const [isEraser, setEraser] = useState(false)

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
        pen={isOpen ? (isEraser ? eraserPen(size) : { color, size }) : null}
        onStroke={put}
      />
      <div className={CROQUIS_BOARD.tools} role="toolbar" aria-label={CROQUIS_BOARD_COPY.palette}>
        <div className={CROQUIS_BOARD.toolGroup}>
          {PENS.map((pen) => (
            <button
              key={pen.key}
              type="button"
              aria-label={pen.label}
              aria-pressed={!isEraser && color === pen.index}
              disabled={!isOpen}
              className={cn(
                CROQUIS_BOARD.pen,
                !isEraser && color === pen.index && CROQUIS_BOARD.penOn
              )}
              style={{ background: `var(${pen.token})` }}
              onClick={() => {
                setColor(pen.index)
                setEraser(false)
              }}
            />
          ))}
        </div>
        <div className={CROQUIS_BOARD.toolGroup} role="group" aria-label={CROQUIS_BOARD_COPY.sizes}>
          {CROQUIS_SIZES.map((nib, index) => (
            <button
              key={nib}
              type="button"
              aria-label={`${CROQUIS_BOARD_COPY.sizes} ${index + 1}`}
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
        <div className={CROQUIS_BOARD.toolGroup}>
          <button
            type="button"
            aria-pressed={isEraser}
            disabled={!isOpen}
            className={cn(CROQUIS_BOARD.action, isEraser && CROQUIS_BOARD.actionOn)}
            onClick={() => setEraser((on) => !on)}
          >
            {CROQUIS_BOARD_COPY.toolEraser}
          </button>
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
