'use client'

import { useMemo, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'

import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import { useOceanGestures } from '@/composites/play/naval/ocean/useOceanGestures'
import type { OceanCell, OceanHandlers } from '@/composites/play/naval/ocean/useOceanGestures'
import { useOceanPainter } from '@/composites/play/naval/ocean/useOceanPainter'
import { firstCamera } from '@/core/lib/play/naval/camera'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { NAVAL_SKIN } from '@/declarations/play/naval/skins'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_OCEAN } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'

export interface NavalOceanProps extends OceanHandlers {
  size: number
  marks: SeaMark[]
  ships?: OceanShip[]
  hover?: OceanCell | null
  zone?: OceanZone | null
  playing?: OceanStrike | null
  isFlat?: boolean
  isDim?: boolean
  label: string
  boxRef?: RefObject<HTMLDivElement | null>
}

/**
 * A sea painted on a canvas, whole in view
 * @param {NavalOceanProps} props - Sea
 * @return {JSX.Element}
 */

export const NavalOcean = ({
  size,
  marks,
  ships = [],
  hover = null,
  zone = null,
  playing = null,
  isFlat,
  isDim,
  label,
  boxRef,
  ...handlers
}: NavalOceanProps) => {
  const ownBox = useRef<HTMLDivElement>(null)
  const box = boxRef ?? ownBox
  const canvas = useRef<HTMLCanvasElement>(null)
  const camera = useMemo(() => firstCamera(size, size), [size])
  const tilt = isFlat ? 0 : NAVAL_VIEW.tilt
  useOceanPainter(canvas, { size, camera, marks, ships, skin: NAVAL_SKIN, hover, zone, playing })
  const gestures = useOceanGestures({ box, size, camera, tilt, ...handlers })
  const view = {
    '--tilt': `${tilt}deg`,
    '--eye': `${NAVAL_VIEW.perspective}px`,
  } as CSSProperties

  return (
    <div
      ref={box}
      className={cn(NAVAL_OCEAN.box, isDim && NAVAL_OCEAN.dim)}
      style={view}
      role="img"
      aria-label={label}
      {...gestures}
    >
      <canvas ref={canvas} className={NAVAL_OCEAN.canvas} />
    </div>
  )
}
