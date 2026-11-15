import { LudoPawn } from '@/composites/play/ludo/LudoPawn'

/**
 * Ludo loading scene, the board pawn hopping over its shadow
 * @return {JSX.Element}
 */

export const LudoLoadScene = () => (
  <div className="relative grid h-40 w-32 place-items-end justify-center" aria-hidden="true">
    <span className="play-scene-shadow absolute bottom-2 h-3 w-16 rounded-full bg-black/30" />
    <LudoPawn colour="red" className="play-scene-pawn mb-3 w-24" />
  </div>
)
