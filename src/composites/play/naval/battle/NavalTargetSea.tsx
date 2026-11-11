'use client'

import { calloutOf } from '@/composites/play/naval/battle/battleCall'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanStrike } from '@/composites/play/naval/fx/paintStrikes'
import type { NavalCallout } from '@/composites/play/naval/fx/useNavalDirector'
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
  isFading?: boolean
  marks: SeaMark[]
  ships: OceanShip[]
  playing: OceanStrike[]
  aim: ReturnType<typeof useNavalAim>
  callout: { callout: NavalCallout; captains: NavalCaptainView[]; viewer: number } | null
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
  isFading,
  marks,
  ships,
  playing,
  aim,
  callout,
}: NavalTargetSeaProps) => {
  const text = callout ? calloutOf(callout.callout, callout.captains, callout.viewer) : null

  return (
    <div className={cn(NAVAL_BOARD.target, isFading && NAVAL_BOARD.seaIn)}>
      <NavalOcean
        size={size}
        map={map}
        marks={marks}
        ships={ships}
        playing={playing}
        hover={aim.isOpen ? aim.hover : null}
        zone={aim.zone}
        isDim={!aim.isOpen && !playing.length}
        isFoe={!isMine}
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
        <div key={callout?.callout.id} className={NAVAL_CALLOUT.root}>
          <span className={cn(NAVAL_CALLOUT.text, NAVAL_CALLOUT[text.tone])}>{text.text}</span>
        </div>
      )}
    </div>
  )
}
