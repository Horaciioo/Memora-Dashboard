'use client'

import type { CSSProperties } from 'react'

import { MODVIEW_MOBILE_COPY as COPY, MODVIEW_TICKER } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'

export interface MobileInfoTickerProps {
  state: ModViewState
  // Opens the information tab
  onOpen: () => void
}

/**
 * Thin banner under the suggestions while something is pinned or polled, its message runs right to left
 * @param {MobileInfoTickerProps} props - Banner props
 * @return {JSX.Element | null}
 */

export const MobileInfoTicker = ({ state, onOpen }: MobileInfoTickerProps) => {
  const lines = [
    state.pinned ? COPY.tickerPinned.replace('{text}', state.pinned.text) : null,
    state.poll?.status === 'active' ? COPY.tickerPoll.replace('{title}', state.poll.title) : null,
  ].filter((line): line is string => line !== null)

  if (lines.length === 0) return null

  const text = lines.join('   ')
  const seconds = Math.max(MODVIEW_TICKER.minSeconds, text.length * MODVIEW_TICKER.secondsPerChar)

  return (
    <button
      type="button"
      className={MODVIEW_MOBILE.ticker}
      aria-label={COPY.tickerOpen}
      onClick={onOpen}
    >
      <span
        className={MODVIEW_MOBILE.tickerTrack}
        style={{ '--ticker-duration': `${seconds}s` } as CSSProperties}
      >
        <span className={MODVIEW_MOBILE.tickerText}>{text}</span>
        <span className={MODVIEW_MOBILE.tickerText} aria-hidden="true">
          {text}
        </span>
      </span>
    </button>
  )
}
