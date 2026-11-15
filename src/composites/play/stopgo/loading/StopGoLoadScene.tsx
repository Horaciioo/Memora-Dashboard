import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'

const CARS: readonly StopGoCarColor[] = ['red', 'blue', 'green', 'yellow']
const LAMPS = [0, 1, 2]
const LAMP_GAP = 26

/**
 * Stop & Go loading scene, four cars on the grid under lights that turn on
 * @return {JSX.Element}
 */

export const StopGoLoadScene = () => (
  <svg viewBox="0 0 220 150" className="h-36 w-52 text-white" aria-hidden="true">
    <rect x="10" y="64" width="200" height="80" rx="6" style={{ fill: 'var(--stopgo-asphalt)' }} />
    <rect x="10" y="64" width="200" height="6" fill="url(#stopgo-load-checker)" />
    <defs>
      <pattern id="stopgo-load-checker" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="white" />
        <rect width="6" height="6" fill="black" />
        <rect x="6" y="6" width="6" height="6" fill="black" />
      </pattern>
    </defs>
    {CARS.map((color, index) => (
      <g
        key={color}
        className="stopgo-load-car"
        style={{ animationDelay: `${index * 90}ms` }}
        transform={`translate(${34 + index * 51} ${index % 2 ? 112 : 100}) scale(0.7)`}
      >
        <StopGoCarShape color={color} />
      </g>
    ))}
    <rect x="76" y="2" width="68" height="34" rx="9" fill="black" opacity="0.7" />
    {LAMPS.map((lamp) => (
      <circle
        key={lamp}
        className="stopgo-load-lamp"
        style={{ animationDelay: `${lamp * 500}ms` }}
        cx={110 + (lamp - 1) * LAMP_GAP}
        cy="19"
        r="9"
      />
    ))}
  </svg>
)
