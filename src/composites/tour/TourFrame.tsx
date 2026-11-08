'use client'

import type { CSSProperties, ReactNode } from 'react'

import { MemoraMark } from '@/components/elements/display/marks/MemoraMark'
import { useFocusTrap } from '@/core/hooks/interaction/layout/overlay/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/layout/overlay/useScrollLock'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { TourCreator } from '@/types/tour'

// A frame like this one is not dismissed
const STAY_OPEN = () => undefined

// Geometry of the portrait and of the window, as the page frame does it
const STAGE_VARS = {
  '--tour-inset': `${TOUR_SETTINGS.paneInsetPx}px`,
  '--tour-photo': `calc((100vw - ${TOUR_SETTINGS.paneInsetPx * 3}px) * ${TOUR_SETTINGS.photoSharePercent / 100})`,
} as CSSProperties

export interface TourFrameProps {
  label: string
  tabTitle: string
  creator: TourCreator | null
  children: ReactNode
}

/**
 * The welcome's frame: the creator's portrait on the left, its title on a tab, Memora's window on the right
 * @param {string} label - Accessible name of the dialog
 * @param {string} tabTitle - Title written on the tab
 * @param {TourCreator | null} creator - Creator whose face the frame shows
 * @param {ReactNode} children - Content of the window
 * @return {JSX.Element}
 */

export const TourFrame = ({ label, tabTitle, creator, children }: TourFrameProps) => {
  const trapRef = useFocusTrap(true, STAY_OPEN)
  useScrollLock(true)

  // The banner suits the tall frame, the logo only stands in without one
  const portrait = creator?.bannerUrl ?? creator?.avatarUrl ?? null

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={TOUR_CHAT.root}
      style={STAGE_VARS}
    >
      <figure className={TOUR_CHAT.figure}>
        {portrait ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" className={TOUR_CHAT.figureImage} />
            <span className={TOUR_CHAT.figureShade} aria-hidden="true" />
          </>
        ) : (
          <span className={TOUR_CHAT.figureFallback} aria-hidden="true">
            <MemoraMark className={TOUR_CHAT.figureGlyph} />
          </span>
        )}
        {creator && <figcaption className={TOUR_CHAT.figureName}>{creator.name}</figcaption>}
      </figure>

      <div className={TOUR_CHAT.tabRail} aria-hidden="true">
        <p className={TOUR_CHAT.tab}>
          {[...tabTitle].map((letter, index) => (
            <span key={index} className={TOUR_CHAT.tabLetter}>
              {letter}
            </span>
          ))}
        </p>
      </div>

      <div className={TOUR_CHAT.window}>{children}</div>
    </div>
  )
}
