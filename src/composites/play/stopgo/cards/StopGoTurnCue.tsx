import { useEffect } from 'react'

import { playStopGoSound } from '@/composites/play/stopgo/sound'
import { fillPlayMessage } from '@/declarations/play/copy'
import { STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import { cn } from '@/utils/classnames'

export interface StopGoTurnCueProps {
  isTurn: boolean
  // The card of the turn is still on the pile
  isWaiting: boolean
  turnNo: number
  holderName: string
  isLive: boolean
}

/**
 * Turn call: a road sign pops up when the turn opens, then two steps tell what to do
 * @param {StopGoTurnCueProps} props - Cue
 * @return {JSX.Element | null} - Nothing out of the race
 */

export const StopGoTurnCue = ({
  isTurn,
  isWaiting,
  turnNo,
  holderName,
  isLive,
}: StopGoTurnCueProps) => {
  // Chime once when the turn opens
  useEffect(() => {
    if (isTurn) playStopGoSound('turn')
  }, [isTurn, turnNo])

  if (!isLive && !isTurn) return null

  if (!isTurn) {
    return (
      <div className={cn(STOPGO_HAND.cue, STOPGO_HAND.cueWait)} role="status">
        {fillPlayMessage(STOPGO_HAND_COPY.stepWait, { name: holderName })}
      </div>
    )
  }

  return (
    <>
      {/* New key per turn, so the sign plays again */}
      <div key={turnNo} className={STOPGO_HAND.cueSplash} aria-hidden="true">
        {STOPGO_HAND_COPY.turnSplash}
      </div>
      <ol className={cn(STOPGO_HAND.cue, STOPGO_HAND.cueSteps)} role="status">
        <li
          className={cn(
            STOPGO_HAND.cueStep,
            isWaiting ? STOPGO_HAND.cueStepOn : STOPGO_HAND.cueStepDone
          )}
        >
          <b>{isWaiting ? '1' : '✓'}</b>
          {STOPGO_HAND_COPY.stepDraw}
        </li>
        <li className={cn(STOPGO_HAND.cueStep, !isWaiting && STOPGO_HAND.cueStepOn)}>
          <b>2</b>
          {STOPGO_HAND_COPY.stepPlay}
        </li>
      </ol>
    </>
  )
}
