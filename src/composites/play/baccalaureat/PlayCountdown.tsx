'use client'

import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { usePlaySessionLoadStore } from '@/core/store/play/playSessionLoad'
import { usePlayCountdownSound } from '@/composites/play/session/usePlayCountdownSound'
import { BAC_BOARD } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

// Game box the count is centred in, the page when absent
const STAGE_SELECTOR = '[data-play-box]'

/**
 * Element the count hangs in: the game box
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
 * Big 3D number in the middle of the game box, held until the loading screen has left
 * @param {Object} props - Countdown
 * @param {PlayGameName} props.game - Game counting
 * @param {number} props.seconds - Seconds left
 * @param {string} [props.lead] - Line above
 * @param {ReactNode} [props.children] - Gestures under the number
 * @param {string} [props.figureClassName] - Figure in the game colour
 * @param {string} [props.className] - Frame, centred in the game box by default
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
  const isCovered = usePlaySessionLoadStore((state) => state.isCovered)
  // Before its first number, or while the loading screen is on
  const isHeld = isCovered || left > total
  usePlayCountdownSound(seconds, isSilent || isHeld, game)
  const host = useSyncExternalStore(still, stageHost, () => null)
  const isOverlay = className === BAC_BOARD.overlay
  if (isHeld) return null

  const count = (
    <div className={className} aria-live="polite">
      <div className={BAC_BOARD.stage}>
        {lead && <span className={BAC_BOARD.stageLead}>{lead}</span>}
        <span key={seconds} className={`play-tick relative ${figureClassName}`}>
          {seconds}
        </span>
        {children}
      </div>
    </div>
  )

  return isOverlay && host ? createPortal(count, host) : count
}
