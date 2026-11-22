import { iso, LudoDieArt, LudoPawnArt, LudoTable } from '@/composites/play/ludo/art/ludoBoard'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { LUDO_BANNER } from '@/declarations/play/ludo/banner'

/**
 * Game card of Ludo, the lacquered board with its pawns and die
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const LudoCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const view = LUDO_BANNER.frames[frame]

  return (
    <>
      <LudoTable view={view} id={`ludo-${frame}`} {...GAME_ART_FRAMES[frame]} />
      {LUDO_BANNER.pawns.map((pawn) => {
        const [x, y] = iso(view, pawn.u + 0.5, pawn.v + 0.5)

        return (
          <LudoPawnArt
            key={`${pawn.u}-${pawn.v}`}
            x={x}
            y={y}
            token={pawn.token}
            cell={view.cell}
          />
        )
      })}
      <g transform={`translate(${view.die.x} ${view.die.y}) rotate(-8)`}>
        <LudoDieArt size={view.cell * 1.2} />
      </g>
    </>
  )
}
