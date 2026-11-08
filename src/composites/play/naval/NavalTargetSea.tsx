'use client'

import type { NavalEvent } from '@/composites/play/naval/useNavalPlayback'
import { calloutOf } from '@/composites/play/naval/battleCall'
import type { NavalCaptainView } from '@/composites/play/naval/captains'
import { NavalMiniMap } from '@/composites/play/naval/ocean/NavalMiniMap'
import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import { useOceanCamera } from '@/composites/play/naval/ocean/useOceanCamera'
import type { useNavalAim } from '@/composites/play/naval/useNavalAim'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD, NAVAL_CALLOUT } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

export interface NavalTargetSeaProps {
  size: number
  seaKey: string
  target: NavalCaptainView
  marks: SeaMark[]
  ships: OceanShip[]
  playing: OceanStrike | null
  aim: ReturnType<typeof useNavalAim>
  callout: { event: NavalEvent; captains: NavalCaptainView[]; viewer: number } | null
}

/**
 * Enemy sea: tilted, zoomable, the aim zone lit, its mini map and the callout of the last strike
 * @param {NavalTargetSeaProps} props - Sea aimed at
 * @return {JSX.Element}
 */

export const NavalTargetSea = ({
  size,
  seaKey,
  target,
  marks,
  ships,
  playing,
  aim,
  callout,
}: NavalTargetSeaProps) => {
  const [camera, setCamera] = useOceanCamera(size, seaKey)
  const text = callout ? calloutOf(callout.event, callout.captains, callout.viewer) : null

  return (
    <div className={NAVAL_BOARD.target}>
      <NavalOcean
        size={size}
        camera={camera}
        setCamera={setCamera}
        marks={marks}
        ships={ships}
        playing={playing}
        hover={aim.isOpen ? aim.hover : null}
        zone={aim.zone}
        isDim={!aim.isOpen && !playing}
        label={fillPlayMessage(NAVAL_BOARD_COPY.seaOf, { name: target.name })}
        onHover={aim.onHover}
        onTap={aim.onTap}
      />
      <NavalMiniMap
        size={size}
        marks={marks}
        ships={ships.map((entry) => entry.ship)}
        camera={camera}
        setCamera={setCamera}
      />
      {text && (
        <div key={callout?.event.id} className={NAVAL_CALLOUT.root}>
          <span className={cn(NAVAL_CALLOUT.text, NAVAL_CALLOUT[text.tone])}>{text.text}</span>
        </div>
      )}
    </div>
  )
}
