'use client'

import type { NavalEvent } from '@/composites/play/naval/battle/useNavalPlayback'
import { calloutOf } from '@/composites/play/naval/battle/battleCall'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import type { useNavalAim } from '@/composites/play/naval/battle/useNavalAim'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD, NAVAL_CALLOUT } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'

export interface NavalTargetSeaProps {
  size: number
  map: string
  target: NavalCaptainView
  isMine?: boolean
  marks: SeaMark[]
  ships: OceanShip[]
  playing: OceanStrike | null
  aim: ReturnType<typeof useNavalAim>
  callout: { event: NavalEvent; captains: NavalCaptainView[]; viewer: number } | null
}

/**
 * Sea shown: the enemy's with the aim zone lit, or the viewer's own when attacked
 * @param {NavalTargetSeaProps} props - Sea aimed at
 * @return {JSX.Element}
 */

export const NavalTargetSea = ({
  size,
  map,
  target,
  isMine,
  marks,
  ships,
  playing,
  aim,
  callout,
}: NavalTargetSeaProps) => {
  const text = callout ? calloutOf(callout.event, callout.captains, callout.viewer) : null

  return (
    <div className={NAVAL_BOARD.target}>
      <NavalOcean
        size={size}
        map={map}
        marks={marks}
        ships={ships}
        playing={playing}
        hover={aim.isOpen ? aim.hover : null}
        zone={aim.zone}
        isDim={!aim.isOpen && !playing}
        label={
          isMine
            ? NAVAL_BOARD_COPY.mine
            : fillPlayMessage(NAVAL_BOARD_COPY.seaOf, { name: target.name })
        }
        onHover={aim.onHover}
        onTap={aim.onTap}
      />
      {isMine && <span className={NAVAL_BOARD.mineTag}>{NAVAL_BOARD_COPY.mine}</span>}
      {text && (
        <div key={callout?.event.id} className={NAVAL_CALLOUT.root}>
          <span className={cn(NAVAL_CALLOUT.text, NAVAL_CALLOUT[text.tone])}>{text.text}</span>
        </div>
      )}
    </div>
  )
}
