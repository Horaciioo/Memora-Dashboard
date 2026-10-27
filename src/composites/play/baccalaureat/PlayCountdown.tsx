import type { ReactNode } from 'react'

import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * Big 3D number in the middle of the page over a blurred room
 * @param {Object} props - Countdown
 * @param {number} props.seconds - Seconds left
 * @param {string} [props.lead] - Line above
 * @param {ReactNode} [props.children] - Gestures under the number
 * @param {string} [props.figureClassName] - Figure in the game colour
 * @param {string} [props.className] - Frame, the blurred overlay by default
 * @return {JSX.Element}
 */

export const PlayCountdown = ({
  seconds,
  lead,
  children,
  figureClassName = BAC_BOARD.figure,
  className = BAC_BOARD.overlay,
}: {
  seconds: number
  lead?: string
  children?: ReactNode
  figureClassName?: string
  className?: string
}) => (
  <div className={className} aria-live="polite">
    <div className={BAC_BOARD.stage}>
      {lead && <span className={BAC_BOARD.stageLead}>{lead}</span>}
      <span key={seconds} className={`play-tick ${figureClassName}`}>
        {seconds}
      </span>
      {children}
    </div>
  </div>
)
