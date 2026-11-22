import { BAC_BANNER } from '@/declarations/play/baccalaureat/banner'

/**
 * Seyès sheet: small and big rulings, verticals and the red margin
 * @param {object} props - Size, ruling and margin
 * @return {JSX.Element}
 */

export const BacSheet = ({
  width,
  height,
  ruling = BAC_BANNER.ruling,
  margin = BAC_BANNER.margin,
}: {
  width: number
  height: number
  ruling?: number
  margin?: number
}) => (
  <>
    <rect width={width} height={height} style={{ fill: 'var(--bac-paper)' }} />
    <g strokeWidth="1">
      {Array.from({ length: Math.ceil(height / (ruling / 4)) }, (_, index) => (
        <path
          key={`h${index}`}
          d={`M0 ${index * (ruling / 4)}H${width}`}
          style={{ stroke: index % 4 === 0 ? 'var(--bac-rule-strong)' : 'var(--bac-rule)' }}
          opacity={index % 4 === 0 ? 0.9 : 0.6}
        />
      ))}
      {Array.from({ length: Math.ceil(width / ruling) }, (_, index) => (
        <path
          key={`v${index}`}
          d={`M${index * ruling} 0V${height}`}
          style={{ stroke: 'var(--bac-rule)' }}
          opacity="0.45"
        />
      ))}
    </g>
    <path d={`M${margin} 0V${height}`} style={{ stroke: 'var(--bac-margin)' }} strokeWidth="2" />
  </>
)

/**
 * Round letter circled in red pen in the margin
 * @param {object} props - Place, letter and size
 * @return {JSX.Element}
 */

export const BacLetter = ({
  x,
  y,
  letter,
  size,
}: {
  x: number
  y: number
  letter: string
  size: number
}) => (
  <g transform={`translate(${x} ${y})`} style={{ fontFamily: 'var(--font-hand)' }}>
    <ellipse
      rx={size * 0.62}
      ry={size * 0.56}
      cy={-size * 0.32}
      fill="none"
      style={{ stroke: 'var(--bac-margin)' }}
      strokeWidth={size * 0.05}
      transform={`rotate(-8 0 ${-size * 0.32})`}
    />
    <text
      textAnchor="middle"
      fontSize={size}
      fontWeight="700"
      style={{ fill: 'var(--bac-margin)' }}
    >
      {letter}
    </text>
  </g>
)
