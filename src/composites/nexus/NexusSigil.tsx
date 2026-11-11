import { NEXUS_STYLES } from '@/declarations/ui/variants'

// Corners of the outer hexagon
const CORNERS = [
  [60, 16],
  [98, 38],
  [98, 82],
  [60, 104],
  [22, 82],
  [22, 38],
] as const

/**
 * Hand drawn mark of the locked console
 * @return {JSX.Element}
 */

export const NexusSigil = () => (
  <svg className={NEXUS_STYLES.sigil} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="54" className={NEXUS_STYLES.sigilFaint} strokeDasharray="2 5" />
    <polygon
      points={CORNERS.map((corner) => corner.join(',')).join(' ')}
      pathLength="1"
      className={NEXUS_STYLES.sigilRing}
    />
    {CORNERS.filter((_, index) => index % 2 === 0).map(([x, y]) => (
      <line key={`${x}-${y}`} x1="60" y1="60" x2={x} y2={y} className={NEXUS_STYLES.sigilFaint} />
    ))}
    <circle cx="60" cy="60" r="16" className={NEXUS_STYLES.sigilLine} />
    <circle cx="60" cy="60" r="5" className={NEXUS_STYLES.sigilCore} />
  </svg>
)
