// Hull outline, bow to the right, on a 100 unit tall strip
const hullPath = (width: number): string =>
  `M6 50Q6 24 46 20H${width - 74}Q${width - 8} 32 ${width - 3} 50Q${width - 8} 68 ${width - 74} 80H46Q6 76 6 50Z`

/**
 * Turret with two barrels
 * @param {Object} props - Turret
 * @param {number} props.x - Centre
 * @return {JSX.Element}
 */

const Turret = ({ x }: { x: number }) => (
  <g>
    <rect x={x - 4} y="43" width="46" height="5" rx="2" className="naval-ship-dark" />
    <rect x={x - 4} y="52" width="46" height="5" rx="2" className="naval-ship-dark" />
    <circle cx={x} cy="50" r="15" className="naval-ship-top" />
    <circle cx={x} cy="50" r="9" className="naval-ship-dark" />
  </g>
)

/**
 * Decks of a ship by length: gun turrets, bridge and funnel, or a flight deck
 * @param {number} length - Squares
 * @param {number} width - Strip width
 * @return {JSX.Element}
 */

const topsides = (length: number, width: number) => {
  if (length >= 5) {
    return (
      <>
        <rect x="30" y="30" width={width - 130} height="40" rx="6" className="naval-ship-top" />
        <path
          d={`M44 50H${width - 150}`}
          stroke="var(--play-naval-hull-deep)"
          strokeWidth="3"
          strokeDasharray="22 16"
        />
        <rect x={width * 0.58} y="14" width="64" height="26" rx="6" className="naval-ship-dark" />
        <rect
          x={width * 0.58 + 10}
          y="20"
          width="22"
          height="12"
          rx="3"
          className="naval-ship-top"
        />
      </>
    )
  }
  if (length === 4) {
    return (
      <>
        <Turret x={64} />
        <Turret x={width - 150} />
        <rect x={width * 0.42} y="33" width="78" height="34" rx="8" className="naval-ship-top" />
        <rect
          x={width * 0.42 + 18}
          y="40"
          width="26"
          height="20"
          rx="4"
          className="naval-ship-dark"
        />
        <circle cx={width * 0.42 + 60} cy="50" r="8" className="naval-ship-dark" />
      </>
    )
  }
  if (length === 3) {
    return (
      <>
        <Turret x={60} />
        <rect x={width * 0.46} y="32" width="64" height="36" rx="8" className="naval-ship-top" />
        <rect
          x={width * 0.46 + 14}
          y="40"
          width="22"
          height="20"
          rx="4"
          className="naval-ship-dark"
        />
        <circle cx={width - 100} cy="50" r="8" className="naval-ship-dark" />
      </>
    )
  }

  return (
    <>
      <rect x="62" y="36" width="58" height="28" rx="8" className="naval-ship-top" />
      <rect x="76" y="42" width="18" height="16" rx="3" className="naval-ship-dark" />
      <circle cx={width - 72} cy="50" r="9" className="naval-ship-dark" />
    </>
  )
}

/**
 * Warship seen from above, drawn to fill one strip of the sea
 * @param {Object} props - Ship
 * @param {number} props.length - Squares
 * @return {JSX.Element}
 */

export const NavalShipArt = ({ length }: { length: number }) => {
  const width = length * 100

  return (
    <svg
      viewBox={`0 0 ${width} 100`}
      preserveAspectRatio="none"
      className="naval-ship-svg"
      aria-hidden="true"
    >
      <path d={hullPath(width)} className="naval-ship-hull" />
      <path d={hullPath(width)} className="naval-ship-edge" />
      <path
        d={`M26 50Q26 34 52 31H${width - 90}Q${width - 30} 38 ${width - 24} 50Q${width - 30} 62 ${width - 90} 69H52Q26 66 26 50Z`}
        className="naval-ship-deck"
      />
      {topsides(length, width)}
    </svg>
  )
}
