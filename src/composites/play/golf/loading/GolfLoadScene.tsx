/**
 * Golf loading scene, a ball hopping into the hole
 * @return {JSX.Element}
 */

export const GolfLoadScene = () => (
  <svg viewBox="0 0 160 120" className="h-36 w-48 text-white" aria-hidden="true">
    <ellipse cx="80" cy="104" rx="72" ry="9" fill="currentColor" opacity="0.28" />
    <ellipse cx="122" cy="100" rx="11" ry="4" fill="black" opacity="0.55" />
    <line
      x1="122"
      y1="100"
      x2="122"
      y2="46"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path className="play-scene-golf-flag" d="M122 46 L146 54 L122 63 Z" fill="currentColor" />
    <ellipse cx="22" cy="102" rx="7" ry="2.4" fill="black" opacity="0.3" />
    <circle className="play-scene-golf-ball" cx="22" cy="95" r="7" fill="currentColor" />
  </svg>
)
