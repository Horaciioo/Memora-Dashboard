import type { StopGoCarColor } from '@/declarations/play/stopgo/art'

export interface StopGoCarShapeProps {
  color: StopGoCarColor
}

/**
 * Single-seater seen from above, nose up, drawn around 0 0 on 44 × 80
 * @param {StopGoCarShapeProps} props - Livery
 * @return {JSX.Element}
 */

export const StopGoCarShape = ({ color }: StopGoCarShapeProps) => {
  const body = `var(--stopgo-car-${color})`
  const shade = `color-mix(in srgb, ${body} 68%, black)`
  const tyre = 'var(--stopgo-asphalt-deep)'

  return (
    <g>
      {/* Cast shadow, offset for the slight dive */}
      <ellipse cx="4" cy="9" rx="24" ry="40" fill="black" opacity="0.22" />
      {/* Four wheels */}
      <g style={{ fill: tyre }}>
        <rect x="-22" y="-27" width="8" height="15" rx="3" />
        <rect x="14" y="-27" width="8" height="15" rx="3" />
        <rect x="-23" y="11" width="9" height="17" rx="3" />
        <rect x="14" y="11" width="9" height="17" rx="3" />
      </g>
      {/* Wings */}
      <rect x="-19" y="-39" width="38" height="6" rx="2.5" style={{ fill: shade }} />
      <rect x="-17" y="30" width="34" height="7" rx="2.5" style={{ fill: shade }} />
      {/* Nose and sidepods */}
      <path d="M-3 -35L3 -35L5 -10L-5 -10z" style={{ fill: body }} />
      <rect x="-11" y="-14" width="22" height="46" rx="9" style={{ fill: body }} />
      <rect x="-11" y="-14" width="22" height="46" rx="9" fill="white" opacity="0.14" />
      {/* Racing stripe */}
      <rect x="-1.6" y="-34" width="3.2" height="62" rx="1.6" fill="white" opacity="0.55" />
      {/* Cockpit and helmet */}
      <ellipse cx="0" cy="3" rx="5.5" ry="8" style={{ fill: tyre }} />
      <circle cx="0" cy="3" r="3.4" fill="white" />
    </g>
  )
}
