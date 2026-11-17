import { FRAME_GEOMETRY as G } from '@/declarations/play/skinGeometry'

const RAD = Math.PI / 180

/**
 * Hexagon path around the centre
 * @param {number} radius - Radius
 * @return {string} - Path
 */

export const hexPath = (radius: number): string =>
  Array.from({ length: 6 }, (_, index) => {
    const angle = (-90 + 60 * index) * RAD

    return `${index ? 'L' : 'M'}${(G.centre + radius * Math.cos(angle)).toFixed(1)} ${(G.centre + radius * Math.sin(angle)).toFixed(1)}`
  }).join(' ') + 'Z'

const Spark = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <g transform={`translate(${G.centre + x} ${G.centre + y})`}>
    <path
      className="skin-spark"
      style={{ animationDelay: `${delay}s` }}
      d={`M0 ${-size} Q0 0 ${size} 0 Q0 0 0 ${size} Q0 0 ${-size} 0 Q0 0 0 ${-size}Z`}
      fill="#fff"
    />
  </g>
)

/**
 * Soft halo behind the frame, from the master metal
 * @param {{ fx: number, id: string }} props - Effects tier and gradient prefix
 * @return {JSX.Element | null}
 */

export const LevelFrameFxBack = ({ fx, id }: { fx: number; id: string }) => {
  if (fx < 3) return null

  return (
    <g clipPath={`url(#${id}o)`}>
      <circle className="skin-halo" cx={G.centre} cy={G.centre} r={G.halo} fill={`url(#${id}h)`} />
    </g>
  )
}

/**
 * Light sweep and sparkles over the frame
 * @param {{ fx: number, id: string }} props - Effects tier and gradient prefix
 * @return {JSX.Element | null}
 */

export const LevelFrameFxFront = ({ fx, id }: { fx: number; id: string }) => {
  if (fx < 2) return null

  return (
    <g clipPath={`url(#${id}o)`}>
      <g clipPath={`url(#${id}k)`}>
        <g transform={`rotate(22 ${G.centre} ${G.centre})`}>
          <g className="skin-sweep">
            <rect x={-10} y={-40} width={34} height={330} fill={`url(#${id}g)`} />
          </g>
        </g>
      </g>
      {fx >= 3 &&
        G.sparks
          .slice(0, fx >= 4 ? 4 : 2)
          .map(([x, y, size, delay]) => (
            <Spark key={`${x}${y}`} x={x} y={y} size={size} delay={delay} />
          ))}
    </g>
  )
}
