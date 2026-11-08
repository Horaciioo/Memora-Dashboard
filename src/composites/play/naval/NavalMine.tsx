'use client'

import { NavalOcean } from '@/composites/play/naval/ocean/NavalOcean'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import { useOceanCamera } from '@/composites/play/naval/ocean/useOceanCamera'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD } from '@/declarations/ui/variants/naval'

/**
 * The viewer's own fleet, small and flat, with the strikes that fall on it
 * @param {Object} props - Fleet panel
 * @param {number} props.size - Squares per side
 * @param {SeaMark[]} props.marks - Shots received
 * @param {OceanShip[]} props.ships - Own ships
 * @param {OceanStrike | null} props.playing - Strike falling on this sea
 * @return {JSX.Element}
 */

export const NavalMine = ({
  size,
  marks,
  ships,
  playing,
}: {
  size: number
  marks: SeaMark[]
  ships: OceanShip[]
  playing: OceanStrike | null
}) => {
  const [camera, setCamera] = useOceanCamera(size, 'mine', size)

  return (
    <div className={NAVAL_BOARD.panel}>
      <span className={NAVAL_BOARD.title}>{NAVAL_BOARD_COPY.yourSea}</span>
      <div className={NAVAL_BOARD.mineSea}>
        <NavalOcean
          size={size}
          camera={camera}
          setCamera={setCamera}
          marks={marks}
          ships={ships}
          playing={playing}
          isFlat
          label={NAVAL_BOARD_COPY.yourSea}
        />
      </div>
    </div>
  )
}
