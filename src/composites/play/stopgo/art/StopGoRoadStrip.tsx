export interface StopGoRoadStripProps {
  // Centre line of the road
  path: string
  // Tarmac width
  width: number
  // Kerb stripe colour, the hub keeps the game red
  color?: string
}

/**
 * Road strip with coloured and white kerbs and a dashed centre line
 * @param {StopGoRoadStripProps} props - Centre line and width
 * @return {JSX.Element}
 */

export const StopGoRoadStrip = ({
  path,
  width,
  color = 'var(--play-stopgo)',
}: StopGoRoadStripProps) => {
  const kerb = width * 1.3
  const dash = width * 0.25

  return (
    <g fill="none" strokeLinejoin="round">
      <path d={path} strokeWidth={kerb} style={{ stroke: 'var(--stopgo-kerb-white)' }} />
      <path
        d={path}
        strokeWidth={kerb}
        strokeDasharray={`${dash} ${dash}`}
        style={{ stroke: color }}
      />
      <path d={path} strokeWidth={width} style={{ stroke: 'var(--stopgo-asphalt)' }} />
      <path
        d={path}
        strokeWidth={width * 0.04}
        strokeDasharray={`${width * 0.22} ${width * 0.18}`}
        style={{ stroke: 'var(--stopgo-line)', opacity: 0.8 }}
      />
    </g>
  )
}
