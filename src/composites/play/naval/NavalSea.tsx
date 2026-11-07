'use client'

import { memo } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

import { NavalShipArt } from '@/composites/play/naval/NavalShipArt'
import { squareName, SeaMarks } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { NAVAL_COLUMNS } from '@/declarations/play/naval/copy'
import { NAVAL_SEA_UI } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Ship drawn on a sea
 * @typedef {Object} SeaShip
 */

export interface SeaShip {
  ship: NavalShip
  isWreck?: boolean
  isPicked?: boolean
  isGhost?: boolean
}

export interface NavalSeaProps {
  size: number
  marks: SeaMark[]
  ships?: SeaShip[]
  // Square aimed at
  aim?: { x: number; y: number } | null
  // Square of the last shot
  fresh?: { x: number; y: number } | null
  // Squares previewed for a placement
  ghost?: { cells: Array<{ x: number; y: number }>; isValid: boolean } | null
  isOpen?: boolean
  isLive?: boolean
  isMini?: boolean
  isShaking?: boolean
  label: string
  squareLabel?: (name: string, mark: SeaMark) => string
  onPick?: (x: number, y: number) => void
  onHover?: (x: number, y: number) => void
  // Shells and blasts, drawn over the water
  effects?: ReactNode
}

// Moves of the arrow keys
const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

/**
 * Move the focus to a neighbour square
 * @param {KeyboardEvent<HTMLElement>} event - Key
 * @param {number} size - Squares per side
 * @return {void}
 */

const moveFocus = (event: KeyboardEvent<HTMLElement>, size: number): void => {
  const step = ARROWS[event.key]
  const target = event.target as HTMLElement
  if (!step || !target.dataset.x) return
  event.preventDefault()
  const x = Math.min(size - 1, Math.max(0, Number(target.dataset.x) + step[0]))
  const y = Math.min(size - 1, Math.max(0, Number(target.dataset.y) + step[1]))
  const next = target.parentElement?.querySelector<HTMLElement>(`[data-x="${x}"][data-y="${y}"]`)
  next?.focus()
}

/**
 * Sea of one captain: labelled grid, ships under the squares, effects over them
 * @param {NavalSeaProps} props - Sea
 * @return {JSX.Element}
 */

const Sea = ({
  size,
  marks,
  ships = [],
  aim,
  fresh,
  ghost,
  isOpen,
  isLive,
  isMini,
  isShaking,
  label,
  squareLabel,
  onPick,
  onHover,
  effects,
}: NavalSeaProps) => {
  const ghostKeys = new Set(ghost?.cells.map(({ x, y }) => `${x},${y}`))
  const vars = { '--size': size } as CSSProperties

  return (
    <div className={cn(NAVAL_SEA_UI.frame, isMini && NAVAL_SEA_UI.frameMini)} style={vars}>
      <div
        className={NAVAL_SEA_UI.columns}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: size }, (_, x) => (
          <span key={x} className={NAVAL_SEA_UI.label}>
            {NAVAL_COLUMNS[x]}
          </span>
        ))}
      </div>
      <div
        className={NAVAL_SEA_UI.rows}
        style={{ gridTemplateRows: `repeat(${size}, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: size }, (_, y) => (
          <span key={y} className={NAVAL_SEA_UI.label}>
            {y + 1}
          </span>
        ))}
      </div>
      <div
        className={cn(NAVAL_SEA_UI.sea, isLive && NAVAL_SEA_UI.live, isShaking && 'naval-shake')}
        role="group"
        aria-label={label}
      >
        <div className={NAVAL_SEA_UI.ships}>
          {ships.map(({ ship, isWreck, isPicked, isGhost }) => (
            <div
              key={ship.id}
              className="naval-ship"
              data-vertical={!ship.isHorizontal}
              data-wreck={Boolean(isWreck)}
              data-picked={Boolean(isPicked)}
              data-ghost={Boolean(isGhost)}
              style={{ '--x': ship.x, '--y': ship.y, '--length': ship.length } as CSSProperties}
            >
              <NavalShipArt length={ship.length} />
            </div>
          ))}
        </div>
        <div className={NAVAL_SEA_UI.cells} onKeyDown={(event) => onPick && moveFocus(event, size)}>
          {Array.from({ length: size * size }, (_, index) => {
            const x = index % size
            const y = Math.floor(index / size)
            const mark = marks[index] ?? SeaMarks.Unknown
            const isAim = aim?.x === x && aim?.y === y
            const common = {
              className: NAVAL_SEA_UI.cell,
              'data-x': x,
              'data-y': y,
              'data-mark': mark === SeaMarks.Hit ? 'hit' : mark === SeaMarks.Miss ? 'miss' : 'none',
              'data-aim': isAim,
              'data-fresh': fresh?.x === x && fresh?.y === y,
              'data-ghost': ghostKeys.has(`${x},${y}`)
                ? ghost?.isValid
                  ? 'ok'
                  : 'bad'
                : undefined,
            }
            if (!onPick) return <div key={index} {...common} />

            return (
              <button
                key={index}
                type="button"
                {...common}
                data-open={Boolean(isOpen) && mark === SeaMarks.Unknown}
                tabIndex={isAim || (!aim && index === 0) ? 0 : -1}
                aria-label={squareLabel?.(squareName(x, y), mark) ?? squareName(x, y)}
                aria-pressed={isAim}
                disabled={!isOpen}
                onClick={() => onPick(x, y)}
                onPointerEnter={() => onHover?.(x, y)}
              />
            )
          })}
        </div>
        <div className={NAVAL_SEA_UI.effects}>{effects}</div>
      </div>
    </div>
  )
}

export const NavalSea = memo(Sea)
