'use client'

import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { usePlayCountdownSound } from '@/composites/play/session/usePlayCountdownSound'
import { BAC_BOARD } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

// Stage the veil covers, the game room or the page
const STAGE_SELECTOR = '[data-play-stage]'

/**
 * Element the veil hangs in: outside the table box, whose blur would trap it
 * @return {Element | null} - Host, none on the server
 */

const stageHost = (): Element | null =>
  document.fullscreenElement ?? document.querySelector(STAGE_SELECTOR) ?? document.body

/**
 * Nothing to follow, the host is read once mounted
 * @return {() => void} - Unsubscribe
 */

const still = () => () => {}

/**
 * Big 3D number in the middle of the page over a blurred room
 * @param {Object} props - Countdown
 * @param {PlayGameName} props.game - Game counting
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
  game,
  seconds: left,
  total,
  lead,
  children,
  figureClassName = BAC_BOARD.figure,
  className = BAC_BOARD.overlay,
  isSilent = false,
}: {
  game: PlayGameName
  seconds: number
  total: number
  lead?: string
  children?: ReactNode
  figureClassName?: string
  className?: string
  isSilent?: boolean
}) => {
  const seconds = Math.min(left, total)
  usePlayCountdownSound(seconds, isSilent, game)
  const host = useSyncExternalStore(still, stageHost, () => null)
  const isVeil = className === BAC_BOARD.overlay

  const count = (
    <div className={className} aria-live="polite">
      <div className={BAC_BOARD.stage}>
        <span key={`halo-${seconds}`} className={BAC_BOARD.halo} aria-hidden="true" />
        {lead && <span className={BAC_BOARD.stageLead}>{lead}</span>}
        <span key={seconds} className={`play-tick relative ${figureClassName}`}>
          {seconds}
        </span>
        {children}
      </div>
    </div>
  )

  return isVeil && host ? createPortal(count, host) : count
}
