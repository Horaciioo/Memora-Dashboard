import { ECHO_BANNER } from '@/declarations/play/echo/banner'

interface Lens {
  x: number
  y: number
  r: number
}

/**
 * Night ground and glow defs of the Écho art
 * @param {object} props - Id prefix, width and height
 * @return {JSX.Element}
 */

export const EchoGround = ({
  id,
  width,
  height,
}: {
  id: string
  width: number
  height: number
}) => (
  <>
    <defs>
      <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--play-echo-night)' }} />
        <stop offset="1" style={{ stopColor: 'var(--play-echo-dusk)' }} />
      </linearGradient>
      <radialGradient id={`${id}-sheen`} cx="0.3" cy="0.25" r="0.8">
        <stop offset="0" stopColor="white" stopOpacity="0.22" />
        <stop offset="0.5" stopColor="white" stopOpacity="0.04" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="40" />
      </filter>
      <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
    <rect width={width} height={height} fill={`url(#${id}-night)`} />
  </>
)

/**
 * One frosted lens, its symbols etched, the shared one lit gold
 * @param {object} props - Lens place, index and id prefix
 * @return {JSX.Element}
 */

export const EchoLens = ({ lens, index, id }: { lens: Lens; index: number; id: string }) => {
  const { x, y, r } = lens
  const unit = r / 120

  return (
    <g>
      <circle
        cx={x}
        cy={y + r * 0.1}
        r={r * 0.9}
        style={{ fill: 'var(--play-echo)' }}
        opacity="0.35"
        filter={`url(#${id}-blur)`}
      />
      <circle cx={x} cy={y} r={r} style={{ fill: 'var(--echo-glass)' }} />
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-sheen)`} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        style={{ stroke: 'var(--echo-glass-edge)' }}
        strokeWidth={Math.max(1.2, unit * 2)}
      />
      <circle
        cx={x}
        cy={y}
        r={r * 0.9}
        fill="none"
        style={{ stroke: 'var(--echo-glass-edge)' }}
        strokeWidth={unit}
        strokeDasharray={`${unit * 2} ${unit * 6}`}
        opacity="0.6"
      />
      {ECHO_BANNER.lenses[index].symbols.map((symbol) => {
        const isCommon = symbol.glyph === ECHO_BANNER.common
        const place = `translate(${x + symbol.x * r} ${y + symbol.y * r}) rotate(${symbol.angle}) scale(${symbol.scale * unit * 1.6})`

        return isCommon ? (
          <g key={symbol.glyph} transform={place}>
            {[22, 30, 38].map((ring, step) => (
              <circle
                key={ring}
                r={ring}
                fill="none"
                style={{ stroke: 'var(--echo-rim-center)' }}
                strokeWidth="0.8"
                opacity={0.5 - step * 0.14}
              />
            ))}
            <path
              d={ECHO_BANNER.glyphs.star}
              style={{ fill: 'var(--echo-rim-center)' }}
              filter={`url(#${id}-glow)`}
            />
            <path d={ECHO_BANNER.glyphs.star} style={{ fill: 'var(--echo-rim-center)' }} />
          </g>
        ) : (
          <path
            key={symbol.glyph}
            d={ECHO_BANNER.glyphs[symbol.glyph]}
            transform={place}
            fill="none"
            style={{ stroke: 'var(--echo-etch)' }}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        )
      })}
    </g>
  )
}
