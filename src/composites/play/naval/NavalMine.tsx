import { NavalSea } from '@/composites/play/naval/NavalSea'
import type { SeaShip } from '@/composites/play/naval/NavalSea'
import { NavalEffects } from '@/composites/play/naval/NavalEffects'
import type { NavalPlaying } from '@/composites/play/naval/useNavalPlayback'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD } from '@/declarations/ui/variants/naval'

/**
 * The viewer's own fleet, small, with the shells that fall on it
 * @param {Object} props - Fleet panel
 * @param {number} props.size - Squares per side
 * @param {SeaMark[]} props.marks - Shots received
 * @param {SeaShip[]} props.ships - Own ships
 * @param {NavalPlaying | null} props.playing - Shell falling on this sea
 * @param {number} props.afloat - Ships afloat
 * @return {JSX.Element}
 */

export const NavalMine = ({
  size,
  marks,
  ships,
  playing,
  afloat,
}: {
  size: number
  marks: SeaMark[]
  ships: SeaShip[]
  playing: NavalPlaying | null
  afloat: number
}) => (
  <div className={NAVAL_BOARD.panel}>
    <div className="mb-2 flex items-baseline justify-between">
      <span className={NAVAL_BOARD.title}>{NAVAL_BOARD_COPY.yourSea}</span>
      <span className={NAVAL_BOARD.sub}>
        {fillPlayMessage(NAVAL_BOARD_COPY.shipsLeft, { count: afloat })}
      </span>
    </div>
    <div className="mx-auto w-[min(100%,15rem)] lg:w-full">
      <NavalSea
        size={size}
        marks={marks}
        ships={ships}
        isMini
        isShaking={playing?.stage === 'impact' && playing.shot.code > 0}
        label={NAVAL_BOARD_COPY.yourSea}
        effects={playing && <NavalEffects playing={playing} />}
      />
    </div>
  </div>
)
