'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { BombDrawing } from '@/composites/play/bomb/BombDrawing'
import { BombHearts } from '@/composites/play/bomb/BombHearts'
import type { BombFace } from '@/composites/play/bomb/types'
import { forwardAngle, seatAngle } from '@/core/lib/play/bomb/table'
import { BOMB_BOARD_COPY, BOMB_MISS_COPY, fillPlayMessage } from '@/declarations/play'
import type { BombMissReason } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BombTableProps {
  seats: BombFace[]
  prompt: string
  turnId: string | null
  draft: string
  miss: { word: string; reason: BombMissReason } | null
  // Player the bomb just went off on
  blastId: string | null
  maxLives: number
}

/**
 * The bomb in the middle, the players around it, an arrow on whoever must answer
 * @param {BombTableProps} props - Seats and turn
 * @return {JSX.Element}
 */

export const BombTable = ({
  seats,
  prompt,
  turnId,
  draft,
  miss,
  blastId,
  maxLives,
}: BombTableProps) => {
  const index = seats.findIndex((seat) => seat.accountId === turnId)
  const target = seatAngle(Math.max(0, index), seats.length)
  // Arrow keeps turning the same way
  const [arrow, setArrow] = useState({ turnId, angle: target })
  if (arrow.turnId !== turnId) setArrow({ turnId, angle: forwardAngle(arrow.angle, target) })

  return (
    <div className={BOMB_BOARD.table}>
      {index >= 0 && (
        <span
          className={BOMB_BOARD.arrow}
          style={{ '--angle': `${arrow.angle}deg` } as CSSProperties}
          aria-hidden="true"
        />
      )}
      <BombDrawing prompt={prompt} isBlasting={Boolean(blastId)} className={BOMB_BOARD.center} />

      {seats.map((seat, place) => {
        const isTurn = seat.accountId === turnId

        return (
          <div
            key={seat.accountId}
            className={cn(
              BOMB_BOARD.seat,
              isTurn && BOMB_BOARD.seatTurn,
              (seat.isOut || seat.hasLeft) && BOMB_BOARD.seatOut,
              seat.accountId === blastId && BOMB_BOARD.seatBlast
            )}
            style={{ '--angle': `${seatAngle(place, seats.length)}deg` } as CSSProperties}
          >
            {seat.isOut ? (
              <span className={BOMB_BOARD.seatNote}>{BOMB_BOARD_COPY.out}</span>
            ) : (
              <BombHearts lives={seat.lives} max={maxLives} />
            )}
            <Avatar name={seat.name} src={seat.avatarUrl} size="md" />
            {!(isTurn && (draft || miss)) && seat.lastWord && (
              <span className={BOMB_BOARD.lastWord}>{seat.lastWord}</span>
            )}
            {isTurn && (draft || miss) && (
              <span className={cn(BOMB_BOARD.draft, miss && BOMB_BOARD.draftMiss)}>
                {miss?.word ?? draft}
              </span>
            )}
            {isTurn && miss && (
              <span className={BOMB_BOARD.missReason}>
                {fillPlayMessage(BOMB_MISS_COPY[miss.reason], { prompt: prompt.toUpperCase() })}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
