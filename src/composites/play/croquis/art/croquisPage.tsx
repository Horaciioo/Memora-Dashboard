import { CROQUIS_BANNER } from '@/declarations/play/croquis/banner'

interface Place {
  x: number
  y: number
  scale: number
}

/**
 * Sketchbook page: warm paper, graphite smudges and the spiral wire on top
 * @param {object} props - Id prefix and size
 * @return {JSX.Element}
 */

export const CroquisPage = ({
  id,
  width,
  height,
}: {
  id: string
  width: number
  height: number
}) => {
  const loop = CROQUIS_BANNER.loop * Math.min(1, width / 1600 + 0.4)
  const ring = loop * 0.26

  return (
    <>
      <defs>
        <filter id={`${id}-smudge`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={width / 60} />
        </filter>
      </defs>
      <rect width={width} height={height} style={{ fill: 'var(--croquis-paper)' }} />
      <g style={{ fill: 'var(--croquis-graphite)' }} opacity="0.08" filter={`url(#${id}-smudge)`}>
        <ellipse cx={width * 0.18} cy={height * 0.62} rx={width * 0.12} ry={height * 0.06} />
        <ellipse cx={width * 0.8} cy={height * 0.85} rx={width * 0.16} ry={height * 0.05} />
      </g>
      {Array.from({ length: Math.floor(width / loop) }, (_, index) => {
        const x = loop / 2 + index * loop

        return (
          <g key={index}>
            <circle
              cx={x}
              cy={ring * 2.6}
              r={ring * 0.55}
              style={{ fill: 'var(--croquis-desk)' }}
            />
            <path
              d={`M${x - ring * 0.3} ${ring * 2.6}C${x - ring * 0.4} ${-ring} ${x + ring * 0.4} ${-ring} ${x + ring * 0.3} ${ring * 2.4}`}
              fill="none"
              style={{ stroke: 'var(--croquis-wire)' }}
              strokeWidth={ring * 0.32}
              strokeLinecap="round"
            />
          </g>
        )
      })}
    </>
  )
}

/**
 * Doodle traced twice, the second pass slightly off like a real pencil
 * @param {object} props - Path, place and weight
 * @return {JSX.Element}
 */

export const CroquisDoodle = ({
  d,
  place,
  weight = 2.2,
}: {
  d: string
  place: Place
  weight?: number
}) => (
  <g
    transform={`translate(${place.x} ${place.y}) scale(${place.scale})`}
    fill="none"
    style={{ stroke: 'var(--croquis-graphite)' }}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} strokeWidth={weight} opacity="0.85" />
    <path
      d={d}
      strokeWidth={weight * 0.6}
      opacity="0.4"
      transform="translate(2.5 -1.5) rotate(0.8)"
    />
  </g>
)
