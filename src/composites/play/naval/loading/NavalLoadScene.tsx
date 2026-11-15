const WAVE = 'M0 86 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0'

/**
 * Naval loading scene, a ship rocking on the waves
 * @return {JSX.Element}
 */

export const NavalLoadScene = () => (
  <svg viewBox="0 0 160 110" className="h-36 w-52 text-white" aria-hidden="true">
    <path className="play-scene-wave" d={`${WAVE} V110 H0 Z`} fill="currentColor" opacity="0.22" />
    <g className="play-scene-ship" fill="currentColor">
      <path d="M36 66 H124 L112 88 H50 Z" />
      <rect x="70" y="50" width="30" height="16" rx="2" />
      <rect x="80" y="38" width="9" height="12" rx="1.5" />
      <line
        x1="62"
        y1="66"
        x2="62"
        y2="40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M62 40 L62 54 L46 54 Z" opacity="0.75" />
    </g>
    <path
      className="play-scene-wave play-scene-wave-front"
      d={`${WAVE} V110 H0 Z`}
      fill="currentColor"
      opacity="0.4"
      transform="translate(0 4)"
    />
  </svg>
)
