'use client'

import { useEffect, useState } from 'react'

import { CheckGlyph } from '@/components/elements/display/glyphs/BrandGlyphs'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { OBSERVE_SUCCESS } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export interface ObserveBoxProps {
  // Seat just taken, the check and the box play their entrance
  justJoined: boolean
  onStop: () => void
  onQuestionnaire: () => void
}

/**
 * Green card of an observer: stop observing, and below a divider the questionnaire
 * @param {boolean} justJoined - Plays the entrance
 * @param {() => void} onStop - Asks to leave the seat
 * @param {() => void} onQuestionnaire - Opens the questions
 * @return {JSX.Element}
 */

export const ObserveBox = ({ justJoined, onStop, onQuestionnaire }: ObserveBoxProps) => {
  // Opens a frame after mounting so the box grows instead of appearing
  const [isOpen, setOpen] = useState(!justJoined)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={OBSERVE_SUCCESS.box}>
      <button type="button" className={OBSERVE_SUCCESS.rowButton} onClick={onStop}>
        <span className={OBSERVE_SUCCESS.row} role="status">
          <span className={cn(OBSERVE_SUCCESS.mark, justJoined && OBSERVE_SUCCESS.markPop)}>
            <CheckGlyph className={OBSERVE_SUCCESS.glyph} />
          </span>
          <span className={cn(justJoined && OBSERVE_SUCCESS.textReveal)}>
            {CANDIDATE_COPY.observing}
          </span>
        </span>
      </button>
      <div
        className={cn(OBSERVE_SUCCESS.fold, isOpen && OBSERVE_SUCCESS.foldOpen)}
        aria-hidden={!isOpen}
      >
        <div className={OBSERVE_SUCCESS.clip}>
          <div className={OBSERVE_SUCCESS.divider} />
          <button
            type="button"
            tabIndex={isOpen ? 0 : -1}
            className={OBSERVE_SUCCESS.rowButton}
            onClick={onQuestionnaire}
          >
            {CANDIDATE_COPY.showQuestionnaire}
          </button>
        </div>
      </div>
    </div>
  )
}
