import { NAVAL_VOTE_FACE } from '@/declarations/ui/variants/games/naval'

// Cells of the sea drawn on the card, a ship lying across two of them
const SEA = Array.from({ length: 9 }, (_, index) => ({
  x: 6 + (index % 3) * 18,
  y: 6 + Math.floor(index / 3) * 18,
}))
const SHIP = [3, 4]

// Centre of a cell
const centre = (index: number) => ({ cx: SEA[index].x + 8, cy: SEA[index].y + 8 })

/**
 * Crosshair over a cell
 * @param {Object} props - Crosshair
 * @param {number} props.cell - Cell index
 * @param {string} props.className - Animation
 * @return {JSX.Element}
 */

const Crosshair = ({ cell, className }: { cell: number; className: string }) => {
  const { cx, cy } = centre(cell)

  return (
    <g
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx={cx} cy={cy} r="6" />
      <path d={`M${cx} ${cy - 10}v5M${cx} ${cy + 5}v5M${cx - 10} ${cy}h5M${cx + 5} ${cy}h5`} />
    </g>
  )
}

/**
 * Face of the "hit, shoot again" card: a first shot hits, then a second one follows or the turn leaves
 * @param {Object} props - Card
 * @param {boolean} props.isOn - The rule is on
 * @return {JSX.Element}
 */

export const NavalReplayFace = ({ isOn }: { isOn: boolean }) => (
  <svg viewBox="0 0 60 60" className={NAVAL_VOTE_FACE.art} aria-hidden="true">
    {SEA.map(({ x, y }, index) => (
      <rect
        key={index}
        x={x}
        y={y}
        width="16"
        height="16"
        rx="3"
        fill="currentColor"
        opacity={SHIP.includes(index) ? 0.7 : 0.2}
      />
    ))}
    <Crosshair cell={SHIP[0]} className="naval-vote-first" />
    {isOn ? (
      <Crosshair cell={SHIP[1]} className="naval-vote-again" />
    ) : (
      <path
        className="naval-vote-pass"
        d="M30 52h22m-6-6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
)

// Fleets as dots: a bracket merges pairs, a melee all aim at the middle
const BRACKET = 'M8 12h10v12H8M18 18h12M8 36h10v12H8M18 42h12M30 18v24M30 30h22'
const MELEE = ['M10 10l16 16', 'M50 10L34 26', 'M10 50l16-16', 'M50 50L34 34']

/**
 * Face of a mode card
 * @param {Object} props - Card
 * @param {boolean} props.isMelee - Everyone against everyone
 * @return {JSX.Element}
 */

export const NavalModeFace = ({ isMelee }: { isMelee: boolean }) => (
  <svg viewBox="0 0 60 60" className={NAVAL_VOTE_FACE.art} aria-hidden="true">
    <g
      className="naval-vote-pulse"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isMelee ? MELEE.map((path) => <path key={path} d={path} />) : <path d={BRACKET} />}
    </g>
    {isMelee && <circle cx="30" cy="30" r="6" fill="currentColor" />}
  </svg>
)
