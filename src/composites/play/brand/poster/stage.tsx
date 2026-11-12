// Hero centre on the 360 × 480 canvas
export const HERO = { x: 180, y: 290 }

// Rays behind the hero
const RAYS = Array.from({ length: 12 }, (_, index) => index * 30)

// Sparks top right of the hero
const SPARKS = [
  [106, -220, 12],
  [140, -178, 7],
  [72, -246, 7],
  [152, -228, 5],
]

/**
 * Fill from a colour token
 * @param {string} token - Colour token
 * @param {number} [opacity] - Opacity
 * @return {object} - Style prop
 */

export const tint = (token: string, opacity = 1) => ({ style: { fill: `var(${token})`, opacity } })

/**
 * Light on a round hero
 * @param {object} props - Hero radius
 * @return {JSX.Element}
 */

export const Sheen = ({ radius }: { radius: number }) => (
  <>
    <path
      d={`M${-radius * 0.68} ${-radius * 0.08}A${radius * 0.7} ${radius * 0.7} 0 0 1 ${-radius * 0.26} ${-radius * 0.66}`}
      stroke="white"
      strokeWidth={radius * 0.12}
      strokeLinecap="round"
      fill="none"
      opacity="0.25"
    />
    <circle cx={-radius * 0.38} cy={-radius * 0.36} r={radius * 0.22} fill="white" opacity="0.14" />
    <circle r={radius} fill="none" stroke="white" strokeWidth="2" opacity="0.1" />
  </>
)

/**
 * Gold sparks over the hero
 * @return {JSX.Element}
 */

export const Sparks = () => (
  <>
    {SPARKS.map(([x, y, r]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={r} {...tint('--play-gold')} />
    ))}
  </>
)

/**
 * Rays, halo and floor shared by every poster
 * @param {object} props - Tone token
 * @return {JSX.Element}
 */

export const Stage = ({ tone }: { tone: string }) => (
  <>
    <g {...tint(`${tone}-glow`, 0.16)} transform={`translate(${HERO.x} ${HERO.y - 10})`}>
      {RAYS.map((angle) => (
        <path key={angle} d="M0 0L-20 -330H20z" transform={`rotate(${angle})`} />
      ))}
    </g>
    <circle cx={HERO.x} cy={HERO.y - 10} r="150" {...tint(`${tone}-glow`, 0.2)} />
    <ellipse cx={HERO.x} cy={HERO.y + 130} rx="104" ry="14" fill="black" opacity="0.3" />
  </>
)
