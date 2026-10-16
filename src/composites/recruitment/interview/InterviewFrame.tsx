import { cn } from '@/utils/classnames'
import type { CSSProperties, ReactNode } from 'react'

import { MemoraMark } from '@/components/elements/display/marks/MemoraMark'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { INTERVIEW, TOUR_CHAT } from '@/declarations/ui/variants'

// Geometry of the portrait and of the window, as the welcome chat does it
const FRAME_VARS = {
  '--tour-inset': `${TOUR_SETTINGS.paneInsetPx}px`,
  '--tour-photo': `calc((100vw - ${TOUR_SETTINGS.paneInsetPx * 3}px) * ${TOUR_SETTINGS.photoSharePercent / 100})`,
} as CSSProperties

export interface InterviewFrameProps {
  portrait: string | null
  caption: string
  // Phones keep the portrait for the introduction only
  isPortraitShown?: boolean
  children: ReactNode
}

/**
 * Creator portrait on the left, title on the tab between, the content in the window
 * @param {string | null} portrait - Banner or logo of the creator
 * @param {string} caption - Creator name over the portrait
 * @param {boolean} [isPortraitShown] - Keeps the portrait on phones
 * @param {ReactNode} children - Window content
 * @return {JSX.Element}
 */

export const InterviewFrame = ({
  portrait,
  caption,
  isPortraitShown = true,
  children,
}: InterviewFrameProps) => (
  <div className={INTERVIEW.frame} style={FRAME_VARS}>
    <figure className={cn(TOUR_CHAT.figure, !isPortraitShown && 'max-lg:hidden')}>
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
      <figcaption className={TOUR_CHAT.figureName}>{caption}</figcaption>
    </figure>

    <div className={TOUR_CHAT.tabRail} aria-hidden="true">
      <p className={TOUR_CHAT.tab}>
        {[...QUESTIONNAIRE_COPY.tabTitle].map((letter, index) => (
          <span key={index} className={TOUR_CHAT.tabLetter}>
            {letter}
          </span>
        ))}
      </p>
    </div>

    <div className={TOUR_CHAT.window}>{children}</div>
  </div>
)
