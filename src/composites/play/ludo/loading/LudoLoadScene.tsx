/**
 * Ludo loading scene, a pawn hopping over its shadow
 * @return {JSX.Element}
 */

export const LudoLoadScene = () => (
  <div className="relative grid h-40 w-32 place-items-end justify-center" aria-hidden="true">
    <span className="play-scene-shadow absolute bottom-2 h-3 w-16 rounded-full bg-black/30" />
    <svg viewBox="0 0 64 96" className="play-scene-pawn h-32 w-20 text-white" fill="currentColor">
      <circle cx="32" cy="20" r="14" />
      <path d="M20 40h24l8 30H12z" />
      <rect x="8" y="70" width="48" height="12" rx="6" />
    </svg>
  </div>
)
