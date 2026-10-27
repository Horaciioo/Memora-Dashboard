import type { ReactNode } from 'react'

import { usePlayCountdownSound } from '@/composites/play/session/usePlayCountdownSound'
import { BAC_BOARD } from '@/declarations/ui/variants'

/**
 * Big 3D number in the middle of the page over a blurred room
 * @param {Object} props - Countdown
 * @param {number} props.seconds - Seconds left
 * @param {string} [props.lead] - Line above
 * @param {ReactNode} [props.children] - Gestures under the number
 * @param {string} [props.figureClassName] - Figure in the game colour
 * @param {string} [props.className] - Frame, the blurred overlay by default
 * @param {number} props.total - Numbers counted, the lead before the first is not shown
 * @param {boolean} [props.isSilent] - Game plays its own sounds
 * @return {JSX.Element}
 */

export const PlayCountdown = ({
  seconds: left,
  total,
  lead,
  children,
  figureClassName = BAC_BOARD.figure,
  className = BAC_BOARD.overlay,
  isSilent = false,
}: {
  seconds: number
  total: number
  lead?: string
  children?: ReactNode
  figureClassName?: string
  className?: string
  isSilent?: boolean
}) => {
  const seconds = Math.min(left, total)
  usePlayCountdownSound(seconds, isSilent)

  return (
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
}
