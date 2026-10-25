'use client'

import { Button } from '@/components/elements/actions/Button'
import { GolfAimGauge } from '@/composites/play/golf/hud/GolfAimGauge'
import { GolfPowerSlot } from '@/composites/play/golf/hud/GolfPowerSlot'
import type { GolfPowerSlotProps } from '@/composites/play/golf/hud/GolfPowerSlot'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_BOARD } from '@/declarations/ui/variants'
import type { GolfPowerName } from '@/utils/constants/play'

export interface GolfFooterProps {
  // Own power slot, none for spectators
  slot: GolfPowerSlotProps | null
  status: string
  maxStrokes: number
  placing: GolfPowerName | null
  onCancelPlace: () => void
}

/**
 * Bottom of the course: power in hand, aim gauge or status, strokes of the hole
 * @param {GolfFooterProps} props - Player and gestures
 * @return {JSX.Element}
 */

export const GolfFooter = ({
  slot,
  status,
  maxStrokes,
  placing,
  onCancelPlace,
}: GolfFooterProps) => (
  <>
    {placing && (
      <div className={GOLF_BOARD.placing}>
        {fillPlayMessage(GOLF_BOARD_COPY.place, { power: GOLF_POWERS.label(placing) })}
        <Button variant="arcadeGhostSmall" onClick={onCancelPlace}>
          {GOLF_BOARD_COPY.cancel}
        </Button>
      </div>
    )}
    <div className={GOLF_BOARD.bottom}>
      {slot ? <GolfPowerSlot {...slot} /> : <span />}
      <div className={GOLF_BOARD.middle}>
        <GolfAimGauge>{status && <p className={GOLF_BOARD.status}>{status}</p>}</GolfAimGauge>
      </div>
      {slot && (
        <div className={GOLF_BOARD.strokes}>
          <span className={GOLF_BOARD.caption}>{GOLF_BOARD_COPY.strokes}</span>
          <span className={GOLF_BOARD.figure}>{slot.me.strokes}</span>
          <span className={GOLF_BOARD.caption}>
            {fillPlayMessage(GOLF_BOARD_COPY.strokesLeft, {
              count: Math.max(0, maxStrokes - slot.me.strokes),
            })}
          </span>
        </div>
      )}
    </div>
  </>
)
